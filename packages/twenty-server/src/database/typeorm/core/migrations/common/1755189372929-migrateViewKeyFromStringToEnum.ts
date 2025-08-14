import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class MigrateViewKeyFromStringToEnum1755189372929
  implements MigrationInterface
{
  name = 'MigrateViewKeyFromStringToEnum1755189372929';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "key"`);
    await queryRunner.query(
      `CREATE TYPE "core"."view_key_enum" AS ENUM('INDEX')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "key" "core"."view_key_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "key"`);
    await queryRunner.query(`DROP TYPE "core"."view_key_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "key" text DEFAULT 'INDEX'`,
    );
  }
}
