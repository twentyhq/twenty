import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { PACKAGED_APPLICATION_SOURCE_TYPES } from 'src/engine/core-modules/application/application-registration/utils/is-packaged-application-source.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredInstanceCommand('2.25.0', 1784921879702, { type: 'slow' })
export class SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand.name,
  );

  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const affectedWorkspaces: { workspaceId: string }[] =
      await dataSource.query(
        `WITH "updated" AS (
           UPDATE "core"."logicFunction" "logicFunction"
           SET "executionMode" = 'PREBUILT'
           FROM "core"."application" "application"
           WHERE "logicFunction"."applicationId" = "application"."id"
             AND "application"."sourceType" = ANY($1)
             AND "logicFunction"."executionMode" = 'LIVE'
             AND "logicFunction"."isBuildUpToDate" = true
             AND "logicFunction"."checksum" IS NOT NULL
             AND "logicFunction"."checksum" <> ''
             AND "logicFunction"."deletedAt" IS NULL
           RETURNING "logicFunction"."workspaceId"
         )
         SELECT DISTINCT "workspaceId" FROM "updated"`,
        [PACKAGED_APPLICATION_SOURCE_TYPES],
      );

    for (const { workspaceId } of affectedWorkspaces) {
      try {
        await this.workspaceCacheService.flush(workspaceId, [
          'flatLogicFunctionMaps',
        ]);
      } catch (error) {
        this.logger.warn(
          `Failed to flush logic function cache for workspace ${workspaceId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    this.logger.log(
      `Set packaged-application logic functions to PREBUILT execution mode across ${affectedWorkspaces.length} workspace(s)`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."logicFunction" "logicFunction"
       SET "executionMode" = 'LIVE'
       FROM "core"."application" "application"
       WHERE "logicFunction"."applicationId" = "application"."id"
         AND "application"."sourceType" = ANY($1)
         AND "logicFunction"."executionMode" = 'PREBUILT'`,
      [PACKAGED_APPLICATION_SOURCE_TYPES],
    );
  }
}
