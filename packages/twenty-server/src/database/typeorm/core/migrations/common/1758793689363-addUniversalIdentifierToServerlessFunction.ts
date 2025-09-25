import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUniversalIdentifierToServerlessFunction1758793689363
  implements MigrationInterface
{
  name = 'AddUniversalIdentifierToServerlessFunction1758793689363';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "universalIdentifier" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "applicationId" uuid`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5b43e65e322d516c9307bed97a" ON "core"."serverlessFunction" ("workspaceId", "universalIdentifier") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_5b43e65e322d516c9307bed97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "applicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "universalIdentifier"`,
    );
  }
}
