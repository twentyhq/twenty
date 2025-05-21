import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInputSchemaToFunction1730803174864
  implements MigrationInterface
{
  name = 'AddInputSchemaToFunction1730803174864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "latestVersionInputSchema" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "latestVersionInputSchema"`,
    );
  }
}
