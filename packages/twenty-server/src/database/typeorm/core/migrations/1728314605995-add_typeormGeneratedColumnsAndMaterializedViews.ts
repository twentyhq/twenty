import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeormGeneratedColumns1728314605995
  implements MigrationInterface
{
  name = 'AddTypeormGeneratedColumnsAndMaterializedViews1728314605995';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE "core"."_typeorm_generated_columns_and_materialized_views" (
                    "type" character varying NOT NULL,
                    "database" character varying,
                    "schema" character varying,
                    "table" character varying,
                    "name" character varying,
                    "value" text
                )
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE "core"."_typeorm_generated_columns_and_materialized_views"`,
    );
  }
}
