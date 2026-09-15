import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRLS1765499361805 implements MigrationInterface {
  name = 'AddRLS1765499361805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."rowLevelPermissionPredicate_operand_enum" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."rowLevelPermissionPredicate" ("universalIdentifier" uuid, "applicationId" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "operand" "core"."rowLevelPermissionPredicate_operand_enum" NOT NULL DEFAULT 'CONTAINS', "value" jsonb, "subFieldName" text, "workspaceMemberFieldMetadataId" uuid, "workspaceMemberSubFieldName" text, "rowLevelPermissionPredicateGroupId" uuid, "positionInRowLevelPermissionPredicateGroup" double precision, "workspaceId" uuid NOT NULL, "roleId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e7ac2b75856fc7f300b5feb0e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e46f3e01227f1c8ee0c8041821" ON "core"."rowLevelPermissionPredicate" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPP_GROUP_ID" ON "core"."rowLevelPermissionPredicate" ("rowLevelPermissionPredicateGroupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPP_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPP_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceId", "roleId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."rowLevelPermissionPredicateGroup_logicaloperator_enum" AS ENUM('AND', 'OR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."rowLevelPermissionPredicateGroup" ("universalIdentifier" uuid, "applicationId" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parentRowLevelPermissionPredicateGroupId" uuid, "logicalOperator" "core"."rowLevelPermissionPredicateGroup_logicaloperator_enum" NOT NULL DEFAULT 'AND', "positionInRowLevelPermissionPredicateGroup" double precision, "workspaceId" uuid NOT NULL, "roleId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5084d63eb632c38d70b974841f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a14b5665091e86d461fb585924" ON "core"."rowLevelPermissionPredicateGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_RLPPG_WORKSPACE_ID_ROLE_ID" ON "core"."rowLevelPermissionPredicateGroup" ("workspaceId", "roleId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_23b36d07d363f81200654fa1334" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_eadcbbb92b6d58c6785a780b5b7" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_d5ee96a9a03761f2c328a29523c" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_b575e84d5ba7f183079c5c8c421" FOREIGN KEY ("workspaceMemberFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_15199deab40d48dd1480a2faf85" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_5fb4b0cebaf1b6418412bf65170" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_67519abd77fc637444720192737" FOREIGN KEY ("rowLevelPermissionPredicateGroupId") REFERENCES "core"."rowLevelPermissionPredicateGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_1e82563accb67114f65a3993b86" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_a41b6a06e3a7ded2204b0fc815d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_3f1abc7557a4e9f4334d41b07d7" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD CONSTRAINT "FK_25bbd97a29478e18061cb58950f" FOREIGN KEY ("parentRowLevelPermissionPredicateGroupId") REFERENCES "core"."rowLevelPermissionPredicateGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_25bbd97a29478e18061cb58950f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_3f1abc7557a4e9f4334d41b07d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_a41b6a06e3a7ded2204b0fc815d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP CONSTRAINT "FK_1e82563accb67114f65a3993b86"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_67519abd77fc637444720192737"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_5fb4b0cebaf1b6418412bf65170"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_15199deab40d48dd1480a2faf85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_b575e84d5ba7f183079c5c8c421"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_d5ee96a9a03761f2c328a29523c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_eadcbbb92b6d58c6785a780b5b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_23b36d07d363f81200654fa1334"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_RLPPG_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a14b5665091e86d461fb585924"`,
    );
    await queryRunner.query(
      `DROP TABLE "core"."rowLevelPermissionPredicateGroup"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."rowLevelPermissionPredicateGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_RLPP_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_RLPP_FIELD_METADATA_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_RLPP_GROUP_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e46f3e01227f1c8ee0c8041821"`,
    );
    await queryRunner.query(`DROP TABLE "core"."rowLevelPermissionPredicate"`);
    await queryRunner.query(
      `DROP TYPE "core"."rowLevelPermissionPredicate_operand_enum"`,
    );
  }
}
