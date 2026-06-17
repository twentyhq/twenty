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

const getDefaultE2eAccessTokenOutputPath = (workspaceId: string): string =>
  join(tmpdir(), `e2e-access-token-${workspaceId}`);

@Command({
  name: 'workspace:seed:e2e-token',
  description:
    'Mint and emit an ACCESS token for the seeded e2e workspace (stdout + file). Intended for the app prod-parity e2e workflow.',
})
export class GenerateE2eAccessTokenCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateE2eAccessTokenCommand.name);

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
        'workspace:seed:e2e-token is only available in development or test environments',
      );
    }

    const userId = USER_DATA_SEED_IDS.JANE;
    const workspaceId = SEED_APPLE_WORKSPACE_ID;

    const token = await this.mintAccessToken({ userId, workspaceId });

    const outputPath =
      process.env.E2E_ACCESS_TOKEN_OUTPUT_PATH ??
      getDefaultE2eAccessTokenOutputPath(workspaceId);

    fs.writeFileSync(outputPath, token, 'utf8');

    this.logger.log(
      `E2E access token written to ${outputPath} (workspaceId=${workspaceId}, userId=${userId})`,
    );

    process.stdout.write(`E2E_ACCESS_TOKEN_PATH=${outputPath}\n`);
    process.stdout.write(`E2E_ACCESS_TOKEN=${token}\n`);
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
        `Failed to mint e2e access token for userId=${userId} workspaceId=${workspaceId}. ` +
          `Ensure the e2e workspace has been seeded first (e.g. nx run twenty-server:database:reset). ` +
          `Cause: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
