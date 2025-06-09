import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUselessServerlessFunctionColumn1748942397538
  implements MigrationInterface
{
  name = 'RemoveUselessServerlessFunctionColumn1748942397538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "syncStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."serverlessFunction_syncstatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."serverlessFunction_syncstatus_enum" AS ENUM('BUILDING', 'NOT_READY', 'READY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "syncStatus" "core"."serverlessFunction_syncstatus_enum" NOT NULL DEFAULT 'NOT_READY'`,
    );
  }
}
