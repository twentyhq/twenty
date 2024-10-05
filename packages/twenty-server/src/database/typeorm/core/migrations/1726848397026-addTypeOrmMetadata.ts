import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeOrmMetadata1726848397026 implements MigrationInterface {
  name = 'AddTypeOrmMetadata1726848397026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "core"."typeorm_metadata" (
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
    await queryRunner.query(`DROP TABLE "core"."typeorm_metadata"`);
  }
}
