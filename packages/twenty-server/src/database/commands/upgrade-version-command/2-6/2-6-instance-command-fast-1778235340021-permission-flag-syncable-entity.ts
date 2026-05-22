import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.6.0', 1778235340021)
export class PermissionFlagSyncableEntityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."permissionFlag" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "key" varchar NOT NULL,
        "label" varchar NOT NULL,
        "description" text,
        "icon" varchar,
        "permissionType" varchar NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "IDX_PERMISSION_FLAG_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId"),
        CONSTRAINT "PK_a02789db60620a1e9f90147b50f" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_PERMISSION_FLAG_APPLICATION_ID" ON "core"."permissionFlag" ("applicationId")`,
    );

    // Reuses canonical hash names freed by the rename migration so TypeORM's
    // schema diff matches without further intervention.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_da8ffd3c24b4a819430a861067" ON "core"."permissionFlag" ("workspaceId", "universalIdentifier")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag"
       ADD CONSTRAINT "FK_835bc9f7ef959debfc5cd268049"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag"
       ADD CONSTRAINT "FK_b26a9d39a88d0e72373c677c6c5"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT IF EXISTS "FK_b26a9d39a88d0e72373c677c6c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT IF EXISTS "FK_835bc9f7ef959debfc5cd268049"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_da8ffd3c24b4a819430a861067"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_PERMISSION_FLAG_APPLICATION_ID"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."permissionFlag"`);
  }
}
