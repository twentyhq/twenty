import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMainGroupByFieldMetadataIdToViewTable1764300000000
  implements MigrationInterface
{
  name = 'AddMainGroupByFieldMetadataIdToViewTable1764300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "mainGroupByFieldMetadataId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "mainGroupByFieldMetadataId"`,
    );
  }
}

