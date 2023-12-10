import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupMetadataTables1700140427984 implements MigrationInterface {
  name = 'SetupMetadataTables1700140427984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "metadata"."relationMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "relationType" character varying NOT NULL, "fromObjectMetadataId" uuid NOT NULL, "toObjectMetadataId" uuid NOT NULL, "fromFieldMetadataId" uuid NOT NULL, "toFieldMetadataId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_3deb257254145a3bdde9575e7d" UNIQUE ("fromFieldMetadataId"), CONSTRAINT "REL_9dea8f90d04edbbf9c541a95c3" UNIQUE ("toFieldMetadataId"), CONSTRAINT "PK_2724f60cb4f17a89481a7e8d7d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."fieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectMetadataId" uuid NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "label" character varying NOT NULL, "targetColumnMap" jsonb NOT NULL, "defaultValue" jsonb, "description" text, "icon" character varying, "enums" text array, "isCustom" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "isSystem" boolean NOT NULL DEFAULT false, "isNullable" boolean DEFAULT true, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "IndexOnNameObjectMetadataIdAndWorkspaceIdUnique" UNIQUE ("name", "objectMetadataId", "workspaceId"), CONSTRAINT "PK_d046b1c7cea325ebc4cdc25e7a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."objectMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dataSourceId" uuid NOT NULL, "nameSingular" character varying NOT NULL, "namePlural" character varying NOT NULL, "labelSingular" character varying NOT NULL, "labelPlural" character varying NOT NULL, "description" text, "icon" character varying, "targetTableName" character varying NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "isSystem" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "IndexOnNamePluralAndWorkspaceIdUnique" UNIQUE ("namePlural", "workspaceId"), CONSTRAINT "IndexOnNameSingularAndWorkspaceIdUnique" UNIQUE ("nameSingular", "workspaceId"), CONSTRAINT "PK_81fb7f4f4244211cfbd188af1e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "metadata"."dataSource_type_enum" AS ENUM('postgres')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."dataSource" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying, "schema" character varying, "type" "metadata"."dataSource_type_enum" NOT NULL DEFAULT 'postgres', "label" character varying, "isRemote" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6d01ae6c0f47baf4f8e37342268" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "metadata"."workspaceMigration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "migrations" jsonb, "name" character varying, "isCustom" boolean NOT NULL DEFAULT false, "appliedAt" TIMESTAMP, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f9b06eb42494795f73acb5c2350" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_f2a0acd3a548ee446a1a35df44d" FOREIGN KEY ("fromObjectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_0f781f589e5a527b8f3d3a4b824" FOREIGN KEY ("toObjectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_3deb257254145a3bdde9575e7d6" FOREIGN KEY ("fromFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" ADD CONSTRAINT "FK_9dea8f90d04edbbf9c541a95c3b" FOREIGN KEY ("toFieldMetadataId") REFERENCES "metadata"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" ADD CONSTRAINT "FK_de2a09b9e3e690440480d2dee26" FOREIGN KEY ("objectMetadataId") REFERENCES "metadata"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" ADD CONSTRAINT "FK_0b19dd17369574578bc18c405b2" FOREIGN KEY ("dataSourceId") REFERENCES "metadata"."dataSource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."objectMetadata" DROP CONSTRAINT "FK_0b19dd17369574578bc18c405b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."fieldMetadata" DROP CONSTRAINT "FK_de2a09b9e3e690440480d2dee26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_9dea8f90d04edbbf9c541a95c3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_3deb257254145a3bdde9575e7d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_0f781f589e5a527b8f3d3a4b824"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."relationMetadata" DROP CONSTRAINT "FK_f2a0acd3a548ee446a1a35df44d"`,
    );
    await queryRunner.query(`DROP TABLE "metadata"."workspaceMigration"`);
    await queryRunner.query(`DROP TABLE "metadata"."dataSource"`);
    await queryRunner.query(`DROP TYPE "metadata"."dataSource_type_enum"`);
    await queryRunner.query(`DROP TABLE "metadata"."objectMetadata"`);
    await queryRunner.query(`DROP TABLE "metadata"."fieldMetadata"`);
    await queryRunner.query(`DROP TABLE "metadata"."relationMetadata"`);
  }
}
