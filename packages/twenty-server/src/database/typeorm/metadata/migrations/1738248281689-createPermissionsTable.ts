import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionsTable1738248281689 implements MigrationInterface {
  name = 'CreatePermissionsTable1738248281689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "canUpdateAllSettings" boolean NOT NULL DEFAULT false, "description" text, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isEditable" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."userWorkspaceRole" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "roleId" uuid NOT NULL, "userWorkspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IndexOnUserWorkspaceRoleUnique" UNIQUE ("userWorkspaceId", "roleId"), CONSTRAINT "PK_9c02cbdd9053fbb6791e21b7146" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "FK_0b70755f23a3705f1bea0ddc7d4" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "FK_0b70755f23a3705f1bea0ddc7d4"`,
    );
    await queryRunner.query(`DROP TABLE "core"."userWorkspaceRole"`);
    await queryRunner.query(`DROP TABLE "core"."role"`);
  }
}
