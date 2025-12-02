import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMainGroupByFieldMetadataId1764680275312
  implements MigrationInterface
{
  name = 'AddMainGroupByFieldMetadataId1764680275312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "mainGroupByFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_d1fa625016e36ec6f79fb13e824" FOREIGN KEY ("mainGroupByFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_d1fa625016e36ec6f79fb13e824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "mainGroupByFieldMetadataId"`,
    );
  }
}
