import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Logic functions of packaged applications (tarball, npm) ship an immutable
// build and now execute their prebuilt bundle. Local-source apps stay LIVE.
// Only functions with a fresh build and a checksum are flipped: PREBUILT
// execution requires both, and the executor installs the bundle on-demand
// from the stored build on first execution.
@RegisteredInstanceCommand('2.23.0', 1784540930631, { type: 'slow' })
export class SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand.name,
  );

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const updatedLogicFunctions: { id: string }[] = await dataSource.query(
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
       RETURNING "logicFunction"."id"`,
    );

    this.logger.log(
      `Set ${updatedLogicFunctions.length} packaged-application logic function(s) to PREBUILT execution mode`,
    );
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
