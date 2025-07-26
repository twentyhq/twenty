import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateViewTablesInCoreSchema1753104458798
  implements MigrationInterface
{
  name = 'CreateViewTablesInCoreSchema1753104458798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."viewField_aggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewField" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "size" integer NOT NULL DEFAULT '0', "position" integer NOT NULL DEFAULT '0', "aggregateOperation" "core"."viewField_aggregateoperation_enum", "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" UNIQUE ("fieldMetadataId", "viewId"), CONSTRAINT "PK_ba2a5aa5f0bd7ac82788fae921e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_WORKSPACE_ID_VIEW_ID" ON "core"."viewField" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilterGroup_logicaloperator_enum" AS ENUM('AND', 'OR', 'NOT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewFilterGroup" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parentViewFilterGroupId" uuid, "logicalOperator" "core"."viewFilterGroup_logicaloperator_enum" NOT NULL DEFAULT 'NOT', "positionInViewFilterGroup" integer, "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_16f55359d609168b826405ed307" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID" ON "core"."viewFilterGroup" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewFilter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "operand" character varying NOT NULL DEFAULT 'Contains', "value" jsonb NOT NULL, "viewFilterGroupId" uuid, "positionInViewFilterGroup" integer, "subFieldName" text, "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_09f9ffa2f66263b9eb301460137" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_FIELD_METADATA_ID" ON "core"."viewFilter" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID" ON "core"."viewFilter" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewGroup" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "fieldValue" text NOT NULL, "position" integer NOT NULL DEFAULT '0', "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d2aa8cad01e9d5e99c23f9ccec3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID" ON "core"."viewGroup" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewSort_direction_enum" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewSort" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "direction" "core"."viewSort_direction_enum" NOT NULL DEFAULT 'ASC', "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" UNIQUE ("fieldMetadataId", "viewId"), CONSTRAINT "PK_eceb74d297f926313af6463d496" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID" ON "core"."viewSort" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_openrecordin_enum" AS ENUM('SIDE_PANEL', 'RECORD_PAGE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_kanbanaggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."view" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL DEFAULT '', "objectMetadataId" uuid NOT NULL, "type" character varying NOT NULL DEFAULT 'table', "key" text DEFAULT 'INDEX', "icon" text NOT NULL, "position" integer NOT NULL DEFAULT '0', "isCompact" boolean NOT NULL DEFAULT false, "openRecordIn" "core"."view_openrecordin_enum" NOT NULL DEFAULT 'SIDE_PANEL', "kanbanAggregateOperation" "core"."view_kanbanaggregateoperation_enum", "kanbanAggregateOperationFieldMetadataId" uuid, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_86cfb9e426c77d60b900fe2b543" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."view" ("workspaceId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_96158de54c78944b5340b6f708e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_c5ab40cd4debb51d588752a4857" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_dce74ab06fa7a2effcbf1b98dff" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_8919a390f4022ab1e40182a5ac3" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_32cabc67e40d24acab541c469a8" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_06858adf0fb54ec88fa602198ca" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_61053f5509cc31e5d7139fba1cb" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_2d7cfc4748058a0ca648835d046" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_5f3278d6791aa4c58423e556ae6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_2b36c6adea4542b4844d9fb1806" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_580dad12c8b92f3a3c307c4e66d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_580dad12c8b92f3a3c307c4e66d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_2b36c6adea4542b4844d9fb1806"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_5f3278d6791aa4c58423e556ae6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_2d7cfc4748058a0ca648835d046"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_61053f5509cc31e5d7139fba1cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_06858adf0fb54ec88fa602198ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_32cabc67e40d24acab541c469a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_8919a390f4022ab1e40182a5ac3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_dce74ab06fa7a2effcbf1b98dff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_c5ab40cd4debb51d588752a4857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_96158de54c78944b5340b6f708e"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."view"`);
    await queryRunner.query(
      `DROP TYPE "core"."view_kanbanaggregateoperation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_openrecordin_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewSort"`);
    await queryRunner.query(`DROP TYPE "core"."viewSort_direction_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewGroup"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewFilter"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewFilterGroup"`);
    await queryRunner.query(
      `DROP TYPE "core"."viewFilterGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewField"`);
    await queryRunner.query(
      `DROP TYPE "core"."viewField_aggregateoperation_enum"`,
    );
  }
}
