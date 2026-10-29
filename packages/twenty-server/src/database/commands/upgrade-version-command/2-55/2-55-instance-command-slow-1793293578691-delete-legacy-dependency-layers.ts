import { Logger } from '@nestjs/common';

import {
  DeleteLayerVersionCommand,
  Lambda,
  ListLayersCommand,
  ListLayerVersionsCommand,
} from '@aws-sdk/client-lambda';
import {
  fromNodeProviderChain,
  fromTemporaryCredentials,
} from '@aws-sdk/credential-providers';
import { isNonEmptyString } from '@sniptt/guards';
import { createHash } from 'crypto';
import { setTimeout } from 'node:timers/promises';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Leaves most of Lambda's 15 req/s control plane quota to live function builds
const LAMBDA_REQUESTS_PER_SECOND = 5;
const LAMBDA_PAGE_SIZE = 50;

const waitForNextLambdaRequest = () =>
  setTimeout(1_000 / LAMBDA_REQUESTS_PER_SECOND);

@RegisteredInstanceCommand('2.55.0', 1793293578691, { type: 'slow' })
export class DeleteLegacyDependencyLayersSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    DeleteLegacyDependencyLayersSlowInstanceCommand.name,
  );

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async runDataMigration(_dataSource: DataSource): Promise<void> {
    if (
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') !==
      LogicFunctionDriverType.LAMBDA
    ) {
      return;
    }

    const lambdaClient = this.buildLambdaClient();

    // Cleanup only: a Lambda failure must not block the upgrade
    try {
      const legacyLayerNames = await this.listLegacyLayerNames(lambdaClient);

      this.logger.log(
        `Deleting ${legacyLayerNames.length} legacy dependency layer(s)`,
      );

      for (const layerName of legacyLayerNames) {
        await this.deleteAllLayerVersions(lambdaClient, layerName);
      }
    } catch (error) {
      this.logger.warn(
        `Stopped deleting legacy dependency layers: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}

  private buildLambdaClient(): Lambda {
    const region = this.twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_REGION');

    return new Lambda({
      region,
      endpoint: this.twentyConfigService.get('LOGIC_FUNCTION_LAMBDA_ENDPOINT'),
      credentials: this.getCredentials(region),
      maxAttempts: 8,
      retryMode: 'adaptive',
    });
  }

  private getCredentials(region: string) {
    const subhostingRole = this.twentyConfigService.get(
      'LOGIC_FUNCTION_LAMBDA_SUBHOSTING_ROLE',
    );

    if (isNonEmptyString(subhostingRole)) {
      return fromTemporaryCredentials({
        params: { RoleArn: subhostingRole, RoleSessionName: 'LambdaSession' },
        clientConfig: { region },
      });
    }

    const accessKeyId = this.twentyConfigService.get(
      'LOGIC_FUNCTION_LAMBDA_ACCESS_KEY_ID',
    );

    if (isNonEmptyString(accessKeyId)) {
      return {
        accessKeyId,
        secretAccessKey: this.twentyConfigService.get(
          'LOGIC_FUNCTION_LAMBDA_SECRET_ACCESS_KEY',
        ),
      };
    }

    return fromNodeProviderChain({ clientConfig: { region } });
  }

  // Inlined so a later change to the runtime namespace cannot change what this deletes
  private getLegacyLayerNamePrefix(): string {
    const lambdaRole = this.twentyConfigService.get(
      'LOGIC_FUNCTION_LAMBDA_ROLE',
    );
    const namespace = createHash('sha256')
      .update(isNonEmptyString(lambdaRole) ? lambdaRole : 'no-role')
      .digest('hex')
      .slice(0, 10);

    return `deps-${namespace}-`;
  }

  private async listLegacyLayerNames(lambdaClient: Lambda): Promise<string[]> {
    const legacyLayerNamePrefix = this.getLegacyLayerNamePrefix();
    const legacyLayerNames: string[] = [];
    let marker: string | undefined;

    do {
      await waitForNextLambdaRequest();

      const { Layers, NextMarker } = await lambdaClient.send(
        new ListLayersCommand({ MaxItems: LAMBDA_PAGE_SIZE, Marker: marker }),
      );

      for (const { LayerName } of Layers ?? []) {
        if (LayerName?.startsWith(legacyLayerNamePrefix)) {
          legacyLayerNames.push(LayerName);
        }
      }

      marker = NextMarker;
    } while (isDefined(marker));

    return legacyLayerNames;
  }

  private async deleteAllLayerVersions(
    lambdaClient: Lambda,
    layerName: string,
  ): Promise<void> {
    let marker: string | undefined;

    do {
      await waitForNextLambdaRequest();

      const { LayerVersions, NextMarker } = await lambdaClient.send(
        new ListLayerVersionsCommand({
          LayerName: layerName,
          MaxItems: LAMBDA_PAGE_SIZE,
          Marker: marker,
        }),
      );

      for (const { Version } of LayerVersions ?? []) {
        await waitForNextLambdaRequest();

        await lambdaClient.send(
          new DeleteLayerVersionCommand({
            LayerName: layerName,
            VersionNumber: Version,
          }),
        );
      }

      marker = NextMarker;
    } while (isDefined(marker));
  }
}
