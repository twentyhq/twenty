import { Logger } from '@nestjs/common';

import { writeFileSync } from 'fs';

import { Command, CommandRunner } from 'nest-commander';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';
import { WorkspaceMigrationV2ExceptionCode } from 'twenty-shared/metadata';

@Command({
  name: 'workspace:compute-twenty-standard-migration',
  description: 'Compute Twenty standard workspace migration.',
})
export class ComputeTwentyStandardWorkspaceMigrationCommand extends CommandRunner {
  private readonly logger = new Logger(
    ComputeTwentyStandardWorkspaceMigrationCommand.name,
  );

  constructor(
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Starting compute Twenty standard workspace migration...');

    // TODO: Implement migration logic here
    const workspaceId = '20202020-ef6f-4118-953c-2b027324b54a';
    const twentyStandardAllFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        createdAt: new Date(),
        workspaceId,
      });

    writeFileSync(
      `${Date.now()}-all-flat-entity-maps.json`,
      JSON.stringify(twentyStandardAllFlatEntityMaps, null, 2),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration({
          buildOptions: {
            isSystemBuild: true,
          },
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: createEmptyFlatEntityMaps(),
              to: twentyStandardAllFlatEntityMaps.flatObjectMetadataMaps,
            },
            flatFieldMetadataMaps: {
              from: createEmptyFlatEntityMaps(),
              to: twentyStandardAllFlatEntityMaps.flatFieldMetadataMaps,
            },
          },
          workspaceId,
        })
        .catch((error) => {
          this.logger.error(error);
          throw new WorkspaceMigrationV2Exception(
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            error.message,
          );
        });

    writeFileSync(
      `${Date.now()}validate-and-build-result.json`,
      JSON.stringify(validateAndBuildResult, null, 2),
    );

    this.logger.log(
      'Compute Twenty standard workspace migration completed successfully.',
    );
  }
}
