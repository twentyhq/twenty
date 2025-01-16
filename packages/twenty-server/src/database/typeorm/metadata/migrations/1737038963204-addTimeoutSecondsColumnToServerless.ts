import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeoutSecondsColumnToServerless1737038963204
  implements MigrationInterface
{
  name = 'AddTimeoutSecondsColumnToServerless1737038963204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "timeoutSeconds" integer NOT NULL DEFAULT '300'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "timeoutSeconds"`,
    );
  }
}
