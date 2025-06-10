import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUniqueToFields1728563893694 implements MigrationInterface {
  name = 'AddIsUniqueToFields1728563893694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD "isUnique" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP COLUMN "indexWhereClause"`,
    );
  }
}
