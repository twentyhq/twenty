import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserWorkspaces1707778127558 implements MigrationInterface {
  name = 'AddUserWorkspaces1707778127558';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."userWorkspace" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
                "userId" uuid NOT NULL REFERENCES core.user(id), 
                "workspaceId" uuid NOT NULL REFERENCES core.workspace(id),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP
            )`,
    );
  }

  public async down(): Promise<void> {}
}
