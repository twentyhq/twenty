import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvitation1724056827317 implements MigrationInterface {
  name = 'AddInvitation1724056827317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE core."appToken" ALTER COLUMN "userId" DROP NOT NULL',
    );

    await queryRunner.query(
      `ALTER TABLE core."appToken" ADD CONSTRAINT "userIdIsNullWhenTypeIsInvitation" CHECK ("appToken".type != 'INVITATION_TOKEN' OR "appToken"."userId" IS NULL)`,
    );

    await queryRunner.query(
      `ALTER TABLE core."appToken" ADD CONSTRAINT "userIdNotNullWhenTypeIsNotInvitation" CHECK ("appToken".type = 'INVITATION_TOKEN' OR "appToken"."userId" NOTNULL)`,
    );

    await queryRunner.query('ALTER TABLE core."appToken" ADD "context" jsonb');

    await queryRunner.query(
      'CREATE UNIQUE INDEX apptoken_unique_invitation_by_user_workspace ON core."appToken" ("workspaceId", ("context" ->> \'email\')) WHERE type = \'INVITATION_TOKEN\';',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX core.apptoken_unique_invitation_by_user_workspace;`,
    );

    await queryRunner.query(
      'DELETE FROM "core"."appToken" WHERE "userId" IS NULL',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP CONSTRAINT "userIdIsNullWhenTypeIsInvitation"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP CONSTRAINT "userIdNotNullWhenTypeIsNotInvitation"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" DROP COLUMN "context"',
    );

    await queryRunner.query(
      'ALTER TABLE core."appToken" ALTER COLUMN "userId" SET NOT NULL',
    );
  }
}
