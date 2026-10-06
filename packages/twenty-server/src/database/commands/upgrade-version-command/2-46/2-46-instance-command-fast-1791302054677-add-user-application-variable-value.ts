import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791302054677)
export class AddUserApplicationVariableValueFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."userApplicationVariableValue" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationVariableId" uuid NOT NULL, "scope" "core"."applicationVariable_scope_enum" NOT NULL DEFAULT 'USER', "userWorkspaceId" uuid NOT NULL, "value" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_USER_APPLICATION_VARIABLE_VALUE_VARIABLE_USER_UNIQUE" UNIQUE ("applicationVariableId", "userWorkspaceId"), CONSTRAINT "CHK_userApplicationVariableValue_scope_user" CHECK ("scope" = 'USER'), CONSTRAINT "CHK_userApplicationVariableValue_value_encrypted" CHECK ("value" LIKE 'enc:v2:%'), CONSTRAINT "PK_51df8f8b24eb8c05e07a3542f92" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_APPLICATION_VARIABLE_VALUE_WORKSPACE_ID" ON "core"."userApplicationVariableValue" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_APPLICATION_VARIABLE_VALUE_USER_WORKSPACE_ID" ON "core"."userApplicationVariableValue" ("userWorkspaceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "IDX_APPLICATION_VARIABLE_ID_SCOPE_UNIQUE" UNIQUE ("id", "scope")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" ADD CONSTRAINT "FK_71281400f08a8466962c3f067e0" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" ADD CONSTRAINT "FK_ef9ee4ba7549728c956374e77eb" FOREIGN KEY ("applicationVariableId", "scope") REFERENCES "core"."applicationVariable"("id","scope") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" ADD CONSTRAINT "FK_5b5a27417740e6bb8f1cb4b8fce" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" DROP CONSTRAINT "FK_5b5a27417740e6bb8f1cb4b8fce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" DROP CONSTRAINT "FK_ef9ee4ba7549728c956374e77eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userApplicationVariableValue" DROP CONSTRAINT "FK_71281400f08a8466962c3f067e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "IDX_APPLICATION_VARIABLE_ID_SCOPE_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_APPLICATION_VARIABLE_VALUE_USER_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_APPLICATION_VARIABLE_VALUE_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."userApplicationVariableValue"`);
  }
}
