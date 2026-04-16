import { Logger } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_EMPTY_WORKSPACE_3_ID,
  SEED_EMPTY_WORKSPACE_4_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
  SeededEmptyWorkspacesIds,
  SeededWorkspacesIds,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { DevSeederService } from 'src/engine/workspace-manager/dev-seeder/services/dev-seeder.service';

type DataSeedWorkspaceOptions = {
  light?: boolean;
};

@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  private readonly logger = new Logger(DataSeedWorkspaceCommand.name);

  constructor(private readonly devSeederService: DevSeederService) {
    super();
  }

  @Option({
    flags: '--light',
    description:
      'Light seed: skip demo custom objects (Pet, Survey, etc.) and limit records to 5 per object',
  })
  parseLight(): boolean {
    return true;
  }

  async run(
    _passedParams: string[],
    options: DataSeedWorkspaceOptions,
  ): Promise<void> {
    const workspaceIds: SeededWorkspacesIds[] = options.light
      ? [SEED_APPLE_WORKSPACE_ID]
      : [SEED_APPLE_WORKSPACE_ID, SEED_YCOMBINATOR_WORKSPACE_ID];

    const emptyWorkspaceIds: SeededEmptyWorkspacesIds[] = [
      SEED_EMPTY_WORKSPACE_3_ID,
      SEED_EMPTY_WORKSPACE_4_ID,
    ];

    try {
      for (const workspaceId of workspaceIds) {
        await this.devSeederService.seedDev(workspaceId, {
          light: options.light,
        });
      }

      for (const workspaceId of emptyWorkspaceIds) {
        await this.devSeederService.seedEmptyWorkspace(workspaceId);
      }
    } catch (error) {
      this.logger.error(error);
      this.logger.error(error.stack);
    }
  }
}
