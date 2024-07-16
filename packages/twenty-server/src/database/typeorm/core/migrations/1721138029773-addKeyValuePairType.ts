import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeyValuePairType1721138029773 implements MigrationInterface {
  name = 'AddKeyValuePairType1721138029773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."keyValuePair_type_enum" AS ENUM('USER_VAR', 'FEATURE_FLAG', 'SYSTEM_VAR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD "type" "core"."keyValuePair_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP COLUMN "type"`,
    );
    await queryRunner.query(`DROP TYPE "core"."keyValuePair_type_enum"`);
  }
}
