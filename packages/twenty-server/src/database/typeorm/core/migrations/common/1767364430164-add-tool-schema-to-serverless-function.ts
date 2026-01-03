import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddToolSchemaToServerlessFunction1767364430164
  implements MigrationInterface
{
  name = 'AddToolSchemaToServerlessFunction1767364430164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "toolDescription" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "toolInputSchema" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "toolOutputSchema" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "toolOutputSchema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "toolInputSchema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "toolDescription"`,
    );
  }
}
