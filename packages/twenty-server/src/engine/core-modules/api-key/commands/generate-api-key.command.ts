import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { addDays } from 'date-fns';
import { Command, CommandRunner, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyService } from 'src/engine/core-modules/api-key/services/api-key.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

type GenerateApiKeyCommandOptions = {
  workspaceId: string;
  name: string;
  expiresIn?: number;
};

const NEVER_EXPIRE_DAYS = 100 * 365;

@Command({
  name: 'workspace:generate-api-key',
  description: 'Generate an API key for a workspace and output the token',
})
export class GenerateApiKeyCommand extends CommandRunner {
  private readonly logger = new Logger(GenerateApiKeyCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly apiKeyService: ApiKeyService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id <workspaceId>',
    description: 'Workspace ID (required)',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Name of the API key',
    defaultValue: 'Developer API Key',
  })
  parseName(value: string): string {
    return value;
  }

  @Option({
    flags: '-e, --expires-in <days>',
    description:
      'Number of days until expiration. Omit for a non-expiring key.',
  })
  parseExpiresIn(value: string): number {
    const days = parseInt(value, 10);

    if (isNaN(days) || days <= 0) {
      throw new Error('--expires-in must be a positive number of days');
    }

    return days;
  }

  async run(
    _passedParams: string[],
    options: GenerateApiKeyCommandOptions,
  ): Promise<void> {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');

    if (
      nodeEnv !== NodeEnvironment.DEVELOPMENT &&
      nodeEnv !== NodeEnvironment.TEST
    ) {
      throw new Error(
        'This command is only available in development or test environments',
      );
    }

    const expiresAt = addDays(
      new Date(),
      options.expiresIn ?? NEVER_EXPIRE_DAYS,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: options.workspaceId },
    });

    if (!isDefined(workspace)) {
      this.logger.error(`Workspace ${options.workspaceId} not found.`);

      return;
    }

    const adminRole = await this.roleRepository.findOne({
      where: {
        workspaceId: workspace.id,
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      },
    });

    if (!isDefined(adminRole)) {
      this.logger.error(`No Admin role found for workspace ${workspace.id}.`);

      return;
    }

    let apiKey: ApiKeyEntity;

    try {
      apiKey = await this.apiKeyService.create({
        name: options.name,
        expiresAt,
        workspaceId: workspace.id,
        roleId: adminRole.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create API key: ${error}`);

      return;
    }

    const tokenResult = await this.apiKeyService.generateApiKeyToken(
      workspace.id,
      apiKey.id,
      expiresAt,
    );

    if (!isDefined(tokenResult)) {
      this.logger.error('Failed to generate token.');

      return;
    }

    console.log(`TOKEN:${tokenResult.token}\n`);
  }
}
