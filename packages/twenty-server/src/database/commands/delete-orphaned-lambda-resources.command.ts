import { InjectDataSource } from '@nestjs/typeorm';

import {
  DeleteFunctionCommand,
  DeleteLayerVersionCommand,
  ListFunctionsCommand,
  ListLayersCommand,
  ListLayerVersionsCommand,
} from '@aws-sdk/client-lambda';
import chalk from 'chalk';
import { Command } from 'nest-commander';
import { setTimeout } from 'node:timers/promises';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { LambdaAwsClientService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/services/lambda-aws-client.service';
import { getLambdaConnectionOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-connection-options.util';
import { getLambdaSdkLayerName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-sdk-layer-name.util';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

// Leaves most of Lambda's 15 req/s control plane quota to live function builds
const LAMBDA_REQUESTS_PER_SECOND = 5;
const LAMBDA_PAGE_SIZE = 50;
const UUID_PATTERN =
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const LOGIC_FUNCTION_NAME_REGEX = new RegExp(`^${UUID_PATTERN}$`, 'i');
const SDK_LAYER_NAME_REGEX = new RegExp(`^sdk-${UUID_PATTERN}-.+$`, 'i');

const waitForNextLambdaRequest = () =>
  setTimeout(1_000 / LAMBDA_REQUESTS_PER_SECOND);

// Fetched again for each request since assumed role credentials expire after an hour
const getPacedLambdaClient = async (
  lambdaAwsClientService: LambdaAwsClientService,
) => {
  await waitForNextLambdaRequest();

  return lambdaAwsClientService.getLambdaClient();
};

@Command({
  name: 'logic-function:delete-orphaned-lambda-resources',
  description:
    'Delete the Lambda functions and SDK layers whose logic function or application no longer exists. SDK layer names carry no instance namespace, so only run it where this instance has its Lambda account and region to itself.',
})
export class DeleteOrphanedLambdaResourcesCommand extends MigrationCommandRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {
    super();
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    if (
      this.twentyConfigService.get('LOGIC_FUNCTION_TYPE') !==
      LogicFunctionDriverType.LAMBDA
    ) {
      this.logger.log('Logic functions do not run on Lambda');

      return;
    }

    const lambdaAwsClientService = new LambdaAwsClientService({
      ...getLambdaConnectionOptions(this.twentyConfigService),
      cacheStorageService: this.cacheStorageService,
    });

    // Lambda is listed before the database, since a resource is only created after its row
    const functionNames = await this.listLogicFunctionNames(
      lambdaAwsClientService,
    );
    const sdkLayerNames = await this.listSdkLayerNames(lambdaAwsClientService);

    const orphanedFunctionNames =
      await this.findOrphanedFunctionNames(functionNames);
    const orphanedSdkLayerNames =
      await this.findOrphanedSdkLayerNames(sdkLayerNames);

    this.logger.log(
      chalk.yellow(
        `Found ${orphanedFunctionNames.length} orphaned function(s) out of ${functionNames.length} and ${orphanedSdkLayerNames.length} orphaned SDK layer(s) out of ${sdkLayerNames.length}`,
      ),
    );

    if (options.dryRun) {
      return;
    }

    let deletedFunctionCount = 0;

    for (const functionName of orphanedFunctionNames) {
      try {
        const lambdaClient = await getPacedLambdaClient(lambdaAwsClientService);

        await lambdaClient.send(
          new DeleteFunctionCommand({ FunctionName: functionName }),
        );

        deletedFunctionCount++;
        this.logger.verbose(`Deleted function ${functionName}`);
      } catch (error) {
        this.logger.warn(
          `Failed to delete function ${functionName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    let deletedSdkLayerCount = 0;

    for (const sdkLayerName of orphanedSdkLayerNames) {
      try {
        await this.deleteAllLayerVersions(lambdaAwsClientService, sdkLayerName);

        deletedSdkLayerCount++;
        this.logger.verbose(`Deleted SDK layer ${sdkLayerName}`);
      } catch (error) {
        this.logger.warn(
          `Failed to delete SDK layer ${sdkLayerName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    this.logger.log(
      chalk.green(
        `Deleted ${deletedFunctionCount} of ${orphanedFunctionNames.length} function(s) and ${deletedSdkLayerCount} of ${orphanedSdkLayerNames.length} SDK layer(s)`,
      ),
    );
  }

  private async listLogicFunctionNames(
    lambdaAwsClientService: LambdaAwsClientService,
  ): Promise<string[]> {
    const lambdaRole = this.twentyConfigService.get(
      'LOGIC_FUNCTION_LAMBDA_ROLE',
    );
    const functionNames: string[] = [];
    let marker: string | undefined;

    do {
      const lambdaClient = await getPacedLambdaClient(lambdaAwsClientService);
      const { Functions, NextMarker } = await lambdaClient.send(
        new ListFunctionsCommand({
          MaxItems: LAMBDA_PAGE_SIZE,
          Marker: marker,
        }),
      );

      // Tool functions are not named by an id, and other instances run with another role
      for (const { FunctionName, Role } of Functions ?? []) {
        if (
          isDefined(FunctionName) &&
          Role === lambdaRole &&
          LOGIC_FUNCTION_NAME_REGEX.test(FunctionName)
        ) {
          functionNames.push(FunctionName);
        }
      }

      marker = NextMarker;
    } while (isDefined(marker));

    return functionNames;
  }

  private async listSdkLayerNames(
    lambdaAwsClientService: LambdaAwsClientService,
  ): Promise<string[]> {
    const sdkLayerNames: string[] = [];
    let marker: string | undefined;

    do {
      const lambdaClient = await getPacedLambdaClient(lambdaAwsClientService);
      const { Layers, NextMarker } = await lambdaClient.send(
        new ListLayersCommand({ MaxItems: LAMBDA_PAGE_SIZE, Marker: marker }),
      );

      for (const { LayerName } of Layers ?? []) {
        if (isDefined(LayerName) && SDK_LAYER_NAME_REGEX.test(LayerName)) {
          sdkLayerNames.push(LayerName);
        }
      }

      marker = NextMarker;
    } while (isDefined(marker));

    return sdkLayerNames;
  }

  private async findOrphanedFunctionNames(
    functionNames: string[],
  ): Promise<string[]> {
    const logicFunctions = await this.dataSource
      .getRepository(LogicFunctionEntity)
      .find({ select: { id: true }, withDeleted: true });
    const logicFunctionIds = new Set(logicFunctions.map(({ id }) => id));

    return functionNames.filter(
      (functionName) => !logicFunctionIds.has(functionName),
    );
  }

  private async findOrphanedSdkLayerNames(
    sdkLayerNames: string[],
  ): Promise<string[]> {
    const applications = await this.dataSource
      .getRepository(ApplicationEntity)
      .find({
        select: { workspaceId: true, universalIdentifier: true },
        withDeleted: true,
      });
    const applicationSdkLayerNames = new Set(
      applications.map(({ workspaceId, universalIdentifier }) =>
        getLambdaSdkLayerName({
          workspaceId,
          applicationUniversalIdentifier: universalIdentifier,
        }),
      ),
    );

    return sdkLayerNames.filter(
      (sdkLayerName) => !applicationSdkLayerNames.has(sdkLayerName),
    );
  }

  private async deleteAllLayerVersions(
    lambdaAwsClientService: LambdaAwsClientService,
    layerName: string,
  ): Promise<void> {
    let marker: string | undefined;

    do {
      const lambdaClient = await getPacedLambdaClient(lambdaAwsClientService);
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
