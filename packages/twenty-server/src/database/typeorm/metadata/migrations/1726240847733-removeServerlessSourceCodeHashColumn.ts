import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveServerlessSourceCodeHashColumn1726240847733
  implements MigrationInterface
{
  name = 'RemoveServerlessSourceCodeHashColumn1726240847733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "sourceCodeHash"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "sourceCodeHash" character varying NOT NULL`,
    );
  }
}
