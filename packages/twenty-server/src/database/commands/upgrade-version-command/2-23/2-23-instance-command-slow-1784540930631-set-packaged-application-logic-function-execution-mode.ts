import { Inject, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { DataSource, QueryRunner } from 'typeorm';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Logic functions of packaged applications (tarball, npm) ship an immutable
// build and now execute their prebuilt bundle. Local-source apps stay LIVE.
// Only functions with a fresh build and a checksum are flipped: PREBUILT
// execution requires both. Bundles are installed best-effort right after the
// flip; the executor also installs on-demand at first execution, covering
// functions whose install failed here and nodes with their own local bundle
// storage.
@RegisteredInstanceCommand('2.23.0', 1784540930631, { type: 'slow' })
export class SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand.name,
  );

  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const updatedLogicFunctions: { id: string; workspaceId: string }[] =
      await dataSource.query(
        `UPDATE "core"."logicFunction" "logicFunction"
         SET "executionMode" = 'PREBUILT'
         FROM "core"."application" "application"
         WHERE "logicFunction"."applicationId" = "application"."id"
           AND "application"."sourceType" IN ('tarball', 'npm')
           AND "logicFunction"."executionMode" = 'LIVE'
           AND "logicFunction"."isBuildUpToDate" = true
           AND "logicFunction"."checksum" IS NOT NULL
           AND "logicFunction"."checksum" <> ''
           AND "logicFunction"."deletedAt" IS NULL
         RETURNING "logicFunction"."id", "logicFunction"."workspaceId"`,
      );

    this.logger.log(
      `Set ${updatedLogicFunctions.length} packaged-application logic function(s) to PREBUILT execution mode`,
    );

    const logicFunctionIdsByWorkspaceId = new Map<string, string[]>();

    for (const { id, workspaceId } of updatedLogicFunctions) {
      const bucket = logicFunctionIdsByWorkspaceId.get(workspaceId) ?? [];

      bucket.push(id);
      logicFunctionIdsByWorkspaceId.set(workspaceId, bucket);
    }

    for (const [
      workspaceId,
      logicFunctionIds,
    ] of logicFunctionIdsByWorkspaceId) {
      await this.installPrebuiltBundlesForWorkspace({
        workspaceId,
        logicFunctionIds,
      });
    }
  }

  private async installPrebuiltBundlesForWorkspace({
    workspaceId,
    logicFunctionIds,
  }: {
    workspaceId: string;
    logicFunctionIds: string[];
  }): Promise<void> {
    try {
      await this.workspaceCacheService.flush(workspaceId, [
        'flatLogicFunctionMaps',
      ]);

      const { flatLogicFunctionMaps, flatApplicationMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
          'flatApplicationMaps',
        ]);

      const driver = this.logicFunctionDriverFactory.getCurrentDriver();

      for (const logicFunctionId of logicFunctionIds) {
        const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: logicFunctionId,
          flatEntityMaps: flatLogicFunctionMaps,
        });
        const flatApplication = isDefined(flatLogicFunction?.applicationId)
          ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
          : undefined;

        if (!isDefined(flatLogicFunction) || !isDefined(flatApplication)) {
          this.logger.warn(
            `Skipping prebuilt bundle install for function '${logicFunctionId}' (workspace=${workspaceId}): function or application not found in workspace cache`,
          );
          continue;
        }

        try {
          await driver.installPrebuiltBundle({
            flatLogicFunction,
            flatApplication,
            applicationUniversalIdentifier: flatApplication.universalIdentifier,
          });
        } catch (error) {
          // Best-effort: the executor installs the bundle on-demand at first
          // execution, so a failed install here must not abort the upgrade.
          this.logger.warn(
            `Failed to install prebuilt bundle for function '${logicFunctionId}' (workspace=${workspaceId}): ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }
    } catch (error) {
      this.logger.warn(
        `Failed to install prebuilt bundles for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."logicFunction" "logicFunction"
       SET "executionMode" = 'LIVE'
       FROM "core"."application" "application"
       WHERE "logicFunction"."applicationId" = "application"."id"
         AND "application"."sourceType" IN ('tarball', 'npm')
         AND "logicFunction"."executionMode" = 'PREBUILT'`,
    );
  }
}
