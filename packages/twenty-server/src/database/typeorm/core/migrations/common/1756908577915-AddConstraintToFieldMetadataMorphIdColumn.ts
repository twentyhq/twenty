import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddConstraintToFieldMetadataMorphIdColumn1756908577915
  implements MigrationInterface
{
  name = 'AddConstraintToFieldMetadataMorphIdColumn1756908577915';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."fieldMetadata"
      ADD CONSTRAINT "chk_morph_relation_requires_morph_id"
      CHECK (
        ("type" != 'MORPH_RELATION') OR 
        ("type" = 'MORPH_RELATION' AND "morphId" IS NOT NULL)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."fieldMetadata"
      DROP CONSTRAINT "chk_morph_relation_requires_morph_id";
    `);
  }
}
