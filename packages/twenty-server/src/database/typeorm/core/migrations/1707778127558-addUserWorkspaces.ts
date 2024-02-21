import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserWorkspaces1707778127558 implements MigrationInterface {
  name = 'AddUserWorkspaces1707778127558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."userWorkspace" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
                "userId" uuid NOT NULL REFERENCES core.user(id), 
                "workspaceId" uuid NOT NULL REFERENCES core.workspace(id),
                "position" float NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP
            )`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."user" DROP CONSTRAINT "FK_2ec910029395fa7655621c88908"`,
    );
  }

  public async down(): Promise<void> {}
}
