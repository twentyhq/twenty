import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddToolSchemaToServerlessFunction1767364430164
  implements MigrationInterface
{
  name = 'AddToolSchemaToServerlessFunction1767364430164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "toolInputSchema" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "isTool" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "isTool"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "toolInputSchema"`,
    );
  }
}
