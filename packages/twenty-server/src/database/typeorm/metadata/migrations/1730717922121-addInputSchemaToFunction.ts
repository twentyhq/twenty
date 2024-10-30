import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInputSchemaToFunction1730717922121
  implements MigrationInterface
{
  name = 'AddInputSchemaToFunction1730717922121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "inputSchema" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "inputSchema"`,
    );
  }
}
