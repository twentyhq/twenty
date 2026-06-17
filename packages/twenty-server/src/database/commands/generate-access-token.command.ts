import { Logger } from '@nestjs/common';

import * as fs from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { Command, CommandRunner } from 'nest-commander';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const getDefaultAccessTokenOutputPath = (workspaceId: string): string =>
  join(tmpdir(), `access-token-${workspaceId}`);

@Command({
  name: 'workspace:generate-access-token',
  description:
    'Mint and emit an ACCESS token for the seeded workspace (stdout + file). Development/test only.',
})
export class GenerateAccessTokenCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateAccessTokenCommand.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');

    if (
      nodeEnv !== NodeEnvironment.DEVELOPMENT &&
      nodeEnv !== NodeEnvironment.TEST
    ) {
      throw new Error(
        'workspace:generate-access-token is only available in development or test environments',
      );
    }

    const userId = USER_DATA_SEED_IDS.JANE;
    const workspaceId = SEED_APPLE_WORKSPACE_ID;

    const token = await this.mintAccessToken({ userId, workspaceId });

    const outputPath =
      process.env.ACCESS_TOKEN_OUTPUT_PATH ??
      getDefaultAccessTokenOutputPath(workspaceId);

    fs.writeFileSync(outputPath, token, 'utf8');

    this.logger.log(
      `Access token written to ${outputPath} (workspaceId=${workspaceId}, userId=${userId})`,
    );

    process.stdout.write(`ACCESS_TOKEN_PATH=${outputPath}\n`);
  }

  private async mintAccessToken({
    userId,
    workspaceId,
  }: {
    userId: string;
    workspaceId: string;
  }): Promise<string> {
    try {
      const { token } = await this.accessTokenService.generateAccessToken({
        userId,
        workspaceId,
        authProvider: AuthProviderEnum.Password,
      });

      return token;
    } catch (error) {
      throw new Error(
        `Failed to mint access token for userId=${userId} workspaceId=${workspaceId}. ` +
          `Ensure the workspace has been seeded first (e.g. nx run twenty-server:database:reset). ` +
          `Cause: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
