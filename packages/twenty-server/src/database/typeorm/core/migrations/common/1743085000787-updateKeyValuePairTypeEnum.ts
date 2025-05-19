import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateKeyValuePairTypeEnum1743085000787
  implements MigrationInterface
{
  name = 'UpdateKeyValuePairTypeEnum1743085000787';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" TYPE text USING "type"::text`,
    );

    await queryRunner.query(
      `UPDATE "core"."keyValuePair" SET "type" = 'USER_VARIABLE' WHERE "type" = 'USER_VAR'`,
    );
    await queryRunner.query(
      `UPDATE "core"."keyValuePair" SET "type" = 'CONFIG_VARIABLE' WHERE "type" = 'SYSTEM_VAR'`,
    );

    await queryRunner.query(`DROP TYPE "core"."keyValuePair_type_enum"`);

    await queryRunner.query(
      `CREATE TYPE "core"."keyValuePair_type_enum" AS ENUM('USER_VARIABLE', 'FEATURE_FLAG', 'CONFIG_VARIABLE')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" TYPE "core"."keyValuePair_type_enum" USING "type"::"core"."keyValuePair_type_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" SET DEFAULT 'USER_VARIABLE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" TYPE text USING "type"::text`,
    );

    await queryRunner.query(
      `UPDATE "core"."keyValuePair" SET "type" = 'USER_VAR' WHERE "type" = 'USER_VARIABLE'`,
    );
    await queryRunner.query(
      `UPDATE "core"."keyValuePair" SET "type" = 'SYSTEM_VAR' WHERE "type" = 'CONFIG_VARIABLE'`,
    );

    await queryRunner.query(`DROP TYPE "core"."keyValuePair_type_enum"`);

    await queryRunner.query(
      `CREATE TYPE "core"."keyValuePair_type_enum" AS ENUM('USER_VAR', 'FEATURE_FLAG', 'SYSTEM_VAR')`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" TYPE "core"."keyValuePair_type_enum" USING "type"::"core"."keyValuePair_type_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ALTER COLUMN "type" SET DEFAULT 'USER_VAR'`,
    );
  }
}
