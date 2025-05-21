import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardId1709894431938 implements MigrationInterface {
  name = 'AddStandardId1709894431938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD "standardId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "standardId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "standardId"`,
    );
  }
}
