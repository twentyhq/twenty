import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddMorphIdColumnToFieldMetadata1756900416105
  implements MigrationInterface
{
  name = 'AddMorphIdColumnToFieldMetadata';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "core"."fieldMetadata" 
      ADD COLUMN "morphId" UUID 
      DEFAULT NULL;
    `);

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

    await queryRunner.query(`
      ALTER TABLE "core"."fieldMetadata" 
      DROP COLUMN "morphId";
    `);
  }
}
