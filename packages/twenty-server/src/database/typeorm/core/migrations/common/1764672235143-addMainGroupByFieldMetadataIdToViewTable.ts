import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMainGroupByFieldMetadataIdToViewTable1764672235143
  implements MigrationInterface
{
  name = 'AddMainGroupByFieldMetadataIdToViewTable1764672235143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_view_mainGroupByFieldMetadataId"`,
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
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_view_mainGroupByFieldMetadataId" FOREIGN KEY ("mainGroupByFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
