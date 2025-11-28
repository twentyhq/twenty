import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMainGroupByFieldMetadataIdForeignKey1764300000001
  implements MigrationInterface
{
  name = 'AddMainGroupByFieldMetadataIdForeignKey1764300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_view_mainGroupByFieldMetadataId" FOREIGN KEY ("mainGroupByFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_view_mainGroupByFieldMetadataId"`,
    );
  }
}

