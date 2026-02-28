import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddWorkspaceIdToApplicationRegistration1772267875869
  implements MigrationInterface
{
  name = 'AddWorkspaceIdToApplicationRegistration1772267875869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD "workspaceId" uuid`,
    );

    // Delete any orphaned registrations that can't be assigned a workspace
    await queryRunner.query(`
      DELETE FROM "core"."applicationRegistration"
      WHERE "workspaceId" IS NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ALTER COLUMN "workspaceId" SET NOT NULL`,
    );

    await queryRunner.query(`
      CREATE INDEX "IDX_APPLICATION_REGISTRATION_WORKSPACE_ID"
      ON "core"."applicationRegistration" ("workspaceId")
    `);

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" ADD CONSTRAINT "FK_94ab20372e448d45088357f884e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP CONSTRAINT "FK_94ab20372e448d45088357f884e"`,
    );

    await queryRunner.query(
      `DROP INDEX "core"."IDX_APPLICATION_REGISTRATION_WORKSPACE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistration" DROP COLUMN "workspaceId"`,
    );
  }
}
