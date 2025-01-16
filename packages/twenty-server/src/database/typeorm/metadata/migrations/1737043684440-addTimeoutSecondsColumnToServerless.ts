import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeoutSecondsColumnToServerless1737043684440
  implements MigrationInterface
{
  name = 'AddTimeoutSecondsColumnToServerless1737043684440';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "timeoutSeconds" integer NOT NULL DEFAULT '300'`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD CONSTRAINT "CHK_6ec7848bc465366f269eba83b3" CHECK ("timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP CONSTRAINT "CHK_6ec7848bc465366f269eba83b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "timeoutSeconds"`,
    );
  }
}
