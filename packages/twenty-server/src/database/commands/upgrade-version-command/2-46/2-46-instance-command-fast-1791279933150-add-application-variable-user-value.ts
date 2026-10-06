import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791279933150)
export class AddApplicationVariableUserValueFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."applicationVariableUserValue" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationVariableId" uuid NOT NULL, "scope" "core"."applicationVariable_scope_enum" NOT NULL DEFAULT 'USER', "userWorkspaceId" uuid NOT NULL, "value" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_APPLICATION_VARIABLE_USER_VALUE_VARIABLE_USER_UNIQUE" UNIQUE ("applicationVariableId", "userWorkspaceId"), CONSTRAINT "CHK_applicationVariableUserValue_scope_user" CHECK ("scope" = 'USER'), CONSTRAINT "CHK_applicationVariableUserValue_value_encrypted" CHECK ("value" LIKE 'enc:v2:%'), CONSTRAINT "PK_e4eea45889921382e28a92f0186" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_APPLICATION_VARIABLE_USER_VALUE_WORKSPACE_ID" ON "core"."applicationVariableUserValue" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_APPLICATION_VARIABLE_USER_VALUE_USER_WORKSPACE_ID" ON "core"."applicationVariableUserValue" ("userWorkspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" ADD CONSTRAINT "FK_99a6005131fcb258f7e524f5cba" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" ADD CONSTRAINT "FK_a5f129b3b454c1143bd3d425f1e" FOREIGN KEY ("applicationVariableId", "scope") REFERENCES "core"."applicationVariable"("id","scope") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" ADD CONSTRAINT "FK_53548d1ff1951b19ac0500682b8" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" DROP CONSTRAINT "FK_53548d1ff1951b19ac0500682b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" DROP CONSTRAINT "FK_a5f129b3b454c1143bd3d425f1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariableUserValue" DROP CONSTRAINT "FK_99a6005131fcb258f7e524f5cba"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_VARIABLE_USER_VALUE_USER_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_VARIABLE_USER_VALUE_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."applicationVariableUserValue"`);
  }
}
