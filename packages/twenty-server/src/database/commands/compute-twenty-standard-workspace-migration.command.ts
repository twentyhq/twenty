import { Logger } from '@nestjs/common';
import { writeFileSync } from 'fs';

import { Command, CommandRunner } from 'nest-commander';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Command({
  name: 'workspace:compute-twenty-standard-migration',
  description: 'Compute Twenty standard workspace migration.',
})
export class ComputeTwentyStandardWorkspaceMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(
    ComputeTwentyStandardWorkspaceMigrationCommand.name,
  );

  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Starting compute Twenty standard workspace migration...');

    // TODO: Implement migration logic here

    const twentyStandardAllFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        createdAt: new Date(),
        workspaceId: '20202020-ef6f-4118-953c-2b027324b54a',
      });
    writeFileSync(
      `${Date.now()}-all-flat-entity-maps.json`,
      JSON.stringify(twentyStandardAllFlatEntityMaps, null, 2),
    );

    this.logger.log(
      'Compute Twenty standard workspace migration completed successfully.',
    );
  }
}
