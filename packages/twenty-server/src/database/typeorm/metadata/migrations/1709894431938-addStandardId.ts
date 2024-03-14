import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardId1709894431938 implements MigrationInterface {
  name = 'AddStandardId1709894431938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD "standardId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD "standardId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP COLUMN "standardId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP COLUMN "standardId"`,
    );
  }
}
