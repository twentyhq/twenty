import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexMetadataTable1718985664968 implements MigrationInterface {
  name = 'AddIndexMetadataTable1718985664968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."indexMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "workspaceId" character varying, "objectMetadataId" uuid NOT NULL, CONSTRAINT "PK_f73bb3c3678aee204e341f0ca4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."indexFieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "indexMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "order" integer NOT NULL, CONSTRAINT "PK_5928f67e43eff7d95aa79fd96fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexMetadata" ADD CONSTRAINT "FK_051487e9b745cb175950130b63f" FOREIGN KEY ("objectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexFieldMetadata" ADD CONSTRAINT "FK_b20192c432612eb710801dd5664" FOREIGN KEY ("indexMetadataId") REFERENCES "metadata"."indexMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."indexFieldMetadata" ADD CONSTRAINT "FK_be0950612a54b58c72bd62d629e" FOREIGN KEY ("fieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metadata"."indexFieldMetadata"`);
    await queryRunner.query(`DROP TABLE "metadata"."indexMetadata"`);
  }
}
