import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumOptions1700663879152 implements MigrationInterface {
  name = 'AddEnumOptions1700663879152';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" RENAME COLUMN "enums" TO "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "options" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "options" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" RENAME COLUMN "options" TO "enums"`,
    );
  }
}
