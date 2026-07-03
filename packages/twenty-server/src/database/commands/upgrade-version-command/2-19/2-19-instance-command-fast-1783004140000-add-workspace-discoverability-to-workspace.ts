import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1783004140000)
export class AddWorkspaceDiscoverabilityToWorkspaceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "core"."workspace_discoverability_enum" AS ENUM('PUBLIC', 'MEMBERS_AND_INVITEES', 'HIDDEN');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD COLUMN IF NOT EXISTS "workspaceDiscoverability" "core"."workspace_discoverability_enum" NOT NULL DEFAULT 'PUBLIC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "workspaceDiscoverability"',
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_discoverability_enum"`,
    );
  }
}
