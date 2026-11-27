import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795109265317)
export class AddAgentPrivacyFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD "isPrivate" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD "createdByUserWorkspaceId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_AGENT_CREATED_BY_USER_WORKSPACE" FOREIGN KEY ("createdByUserWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_AGENT_CREATED_BY_USER_WORKSPACE" ON "core"."agent" ("createdByUserWorkspaceId") ',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_AGENT_CREATED_BY_USER_WORKSPACE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_AGENT_CREATED_BY_USER_WORKSPACE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP COLUMN "createdByUserWorkspaceId"',
    );
    await queryRunner.query('ALTER TABLE "core"."agent" DROP COLUMN "isPrivate"');
  }
}
