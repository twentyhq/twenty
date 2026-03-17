import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandardIndexViewNames1773730248299 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE core."view"
            SET name = 'All {objectLabelPlural}'
            WHERE "isCustom" = false 
              AND key = 'INDEX' 
              AND name LIKE 'All %' 
              AND name != 'All {objectLabelPlural}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE core."view" v
      SET name = 'All ' || om."namePlural"
      FROM core."objectMetadata" om
      WHERE v."objectMetadataId" = om.id 
        AND v."isCustom" = false 
        AND v.key = 'INDEX' 
        AND v.name = 'All {objectLabelPlural}';
    `);
  }
}
