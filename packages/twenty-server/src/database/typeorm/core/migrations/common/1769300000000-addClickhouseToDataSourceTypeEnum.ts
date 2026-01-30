import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddClickhouseToDataSourceTypeEnum1769300000000
  implements MigrationInterface
{
  name = 'AddClickhouseToDataSourceTypeEnum1769300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."dataSource_type_enum" RENAME TO "dataSource_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."dataSource_type_enum" AS ENUM('postgres', 'clickhouse')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" TYPE "core"."dataSource_type_enum" USING "type"::"text"::"core"."dataSource_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" SET DEFAULT 'postgres'`,
    );
    await queryRunner.query(`DROP TYPE "core"."dataSource_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."dataSource_type_enum_old" AS ENUM('postgres')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" TYPE "core"."dataSource_type_enum_old" USING "type"::"text"::"core"."dataSource_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."dataSource" ALTER COLUMN "type" SET DEFAULT 'postgres'`,
    );
    await queryRunner.query(`DROP TYPE "core"."dataSource_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."dataSource_type_enum_old" RENAME TO "dataSource_type_enum"`,
    );
  }
}
