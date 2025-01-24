import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeoutSecondsColumnToServerless1737047131108
  implements MigrationInterface
{
  name = 'AddTimeoutSecondsColumnToServerless1737047131108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "timeoutSeconds" integer NOT NULL DEFAULT '300'`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD CONSTRAINT "CHK_4a5179975ee017934a91703247" CHECK ("timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP CONSTRAINT "CHK_4a5179975ee017934a91703247"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "timeoutSeconds"`,
    );
  }
}
