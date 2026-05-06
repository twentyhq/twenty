import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777966965587)
export class TransformApplicationVariableToSyncableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_78ae6cfe5f49a76c4bf842ad58"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD "universalIdentifier" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" DROP COLUMN "universalIdentifier"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "IDX_APPLICATION_VARIABLE_KEY_APPLICATION_ID_UNIQUE" UNIQUE ("key", "applicationId")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_78ae6cfe5f49a76c4bf842ad58" ON "core"."applicationVariable" ("workspaceId") ',
    );
  }
}
