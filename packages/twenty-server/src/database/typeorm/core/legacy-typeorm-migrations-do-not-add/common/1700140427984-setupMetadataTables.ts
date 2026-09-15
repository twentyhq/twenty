import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class SetupMetadataTables1700140427984 implements MigrationInterface {
  name = 'SetupMetadataTables1700140427984';

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
    await queryRunner.query(
      `CREATE TABLE "core"."apiKey" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ae3a5e8e04fb402b2dc8d6ce4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_API_KEY_WORKSPACE_ID" ON "core"."apiKey" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."keyValuePair_type_enum" AS ENUM('USER_VARIABLE', 'FEATURE_FLAG', 'CONFIG_VARIABLE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."keyValuePair" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "workspaceId" uuid, "key" text NOT NULL, "value" jsonb, "textValueDeprecated" text, "type" "core"."keyValuePair_type_enum" NOT NULL DEFAULT 'USER_VARIABLE', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IDX_KEY_VALUE_PAIR_KEY_USER_ID_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "userId", "workspaceId"), CONSTRAINT "PK_c5a1ca828435d3eaf8f9361ed4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_USER_ID_NULL_WORKSPACE_ID_UNIQUE" ON "core"."keyValuePair" ("key", "userId") WHERE "workspaceId" is NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE" ON "core"."keyValuePair" ("key", "workspaceId") WHERE "userId" is NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."twoFactorAuthenticationMethod_status_enum" AS ENUM('PENDING', 'VERIFIED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."twoFactorAuthenticationMethod_strategy_enum" AS ENUM('TOTP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."twoFactorAuthenticationMethod" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userWorkspaceId" uuid NOT NULL, "secret" text NOT NULL, "status" "core"."twoFactorAuthenticationMethod_status_enum" NOT NULL, "strategy" "core"."twoFactorAuthenticationMethod_strategy_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c455f6a499e7110fc95e4bea540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_2909f5139c479e4632df03fd5e" ON "core"."twoFactorAuthenticationMethod" ("userWorkspaceId", "strategy") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."userWorkspace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "defaultAvatarUrl" character varying, "locale" character varying NOT NULL DEFAULT 'en', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_222871f3641385e36e0b9f82aeb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_WORKSPACE_WORKSPACE_ID" ON "core"."userWorkspace" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_WORKSPACE_USER_ID" ON "core"."userWorkspace" ("userId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE" ON "core"."userWorkspace" ("userId", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL DEFAULT '', "lastName" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL, "defaultAvatarUrl" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "disabled" boolean NOT NULL DEFAULT false, "passwordHash" character varying, "canImpersonate" boolean NOT NULL DEFAULT false, "canAccessFullAdminPanel" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "locale" character varying NOT NULL DEFAULT 'en', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON "core"."user" ("email") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."appToken" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "workspaceId" uuid, "type" text NOT NULL DEFAULT 'REFRESH_TOKEN', "value" text, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "context" jsonb, CONSTRAINT "PK_143bfe36c6284c6d3a52c94741f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."approvedAccessDomain" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" character varying NOT NULL, "isValidated" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, CONSTRAINT "IDX_APPROVED_ACCESS_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE" UNIQUE ("domain", "workspaceId"), CONSTRAINT "PK_523281ce57c84e1a039f4538c19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."featureFlag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_894efa1b1822de801f3b9e04069" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."postgresCredentials" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, CONSTRAINT "PK_3f9c4cdf895bfea0a6ea15bdd81" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspaceSSOIdentityProvider_status_enum" AS ENUM('Active', 'Inactive', 'Error')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspaceSSOIdentityProvider_type_enum" AS ENUM('OIDC', 'SAML')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."workspaceSSOIdentityProvider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "status" "core"."workspaceSSOIdentityProvider_status_enum" NOT NULL DEFAULT 'Active', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "core"."workspaceSSOIdentityProvider_type_enum" NOT NULL DEFAULT 'OIDC', "issuer" character varying NOT NULL, "clientID" character varying, "clientSecret" character varying, "ssoURL" character varying, "certificate" character varying, "fingerprint" character varying, CONSTRAINT "PK_a4e3928eb641e7cd612042b628b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."dataSource_type_enum" AS ENUM('postgres')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."dataSource" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying, "url" character varying, "schema" character varying, "type" "core"."dataSource_type_enum" NOT NULL DEFAULT 'postgres', "isRemote" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6d01ae6c0f47baf4f8e37342268" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT" ON "core"."dataSource" ("workspaceId", "createdAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."objectPermission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "canReadObjectRecords" boolean, "canUpdateObjectRecords" boolean, "canSoftDeleteObjectRecords" boolean, "canDestroyObjectRecords" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_OBJECT_PERMISSION_OBJECT_METADATA_ID_ROLE_ID_UNIQUE" UNIQUE ("objectMetadataId", "roleId"), CONSTRAINT "PK_23a4033c1aa380d0d1431731add" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_OBJECT_PERMISSION_WORKSPACE_ID_ROLE_ID" ON "core"."objectPermission" ("workspaceId", "roleId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."permissionFlag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "flag" character varying NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE" UNIQUE ("flag", "roleId"), CONSTRAINT "PK_a02789db60620a1e9f90147b50f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."roleTargets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "roleId" uuid NOT NULL, "userWorkspaceId" uuid, "agentId" uuid, "apiKeyId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("userWorkspaceId", "roleId", "agentId", "apiKeyId"), CONSTRAINT "CHK_role_targets_single_entity" CHECK (("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NOT NULL)), CONSTRAINT "PK_0fe0b3be0a4a966e76c00f44df9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGETS_API_KEY_ID" ON "core"."roleTargets" ("apiKeyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGETS_AGENT_ID" ON "core"."roleTargets" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGETS_WORKSPACE_ID" ON "core"."roleTargets" ("userWorkspaceId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standardId" uuid, "label" character varying NOT NULL, "canUpdateAllSettings" boolean NOT NULL DEFAULT false, "canAccessAllTools" boolean NOT NULL DEFAULT false, "canReadAllObjectRecords" boolean NOT NULL DEFAULT false, "canUpdateAllObjectRecords" boolean NOT NULL DEFAULT false, "canSoftDeleteAllObjectRecords" boolean NOT NULL DEFAULT false, "canDestroyAllObjectRecords" boolean NOT NULL DEFAULT false, "description" text, "icon" character varying, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "isEditable" boolean NOT NULL DEFAULT true, "canBeAssignedToUsers" boolean NOT NULL DEFAULT true, "canBeAssignedToAgents" boolean NOT NULL DEFAULT true, "canBeAssignedToApiKeys" boolean NOT NULL DEFAULT true, CONSTRAINT "IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE" UNIQUE ("label", "workspaceId"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."fieldPermission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "canReadFieldValue" boolean, "canUpdateFieldValue" boolean, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE" UNIQUE ("fieldMetadataId", "roleId"), CONSTRAINT "PK_d7bb911e4f9b1b5e3bfcfdd1c4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID" ON "core"."fieldPermission" ("workspaceId", "roleId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."objectMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standardId" uuid, "dataSourceId" uuid NOT NULL, "nameSingular" character varying NOT NULL, "namePlural" character varying NOT NULL, "labelSingular" character varying NOT NULL, "labelPlural" character varying NOT NULL, "description" text, "icon" character varying, "standardOverrides" jsonb, "targetTableName" character varying NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "isRemote" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "isSystem" boolean NOT NULL DEFAULT false, "isUIReadOnly" boolean NOT NULL DEFAULT false, "isAuditLogged" boolean NOT NULL DEFAULT true, "isSearchable" boolean NOT NULL DEFAULT false, "duplicateCriteria" jsonb, "shortcut" character varying, "labelIdentifierFieldMetadataId" uuid, "imageIdentifierFieldMetadataId" uuid, "isLabelSyncedWithName" boolean NOT NULL DEFAULT false, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_OBJECT_METADATA_NAME_PLURAL_WORKSPACE_ID_UNIQUE" UNIQUE ("namePlural", "workspaceId"), CONSTRAINT "IDX_OBJECT_METADATA_NAME_SINGULAR_WORKSPACE_ID_UNIQUE" UNIQUE ("nameSingular", "workspaceId"), CONSTRAINT "PK_81fb7f4f4244211cfbd188af1e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."indexMetadata_indextype_enum" AS ENUM('BTREE', 'GIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."indexMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "workspaceId" character varying, "objectMetadataId" uuid NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "isUnique" boolean NOT NULL DEFAULT false, "indexWhereClause" text, "indexType" "core"."indexMetadata_indextype_enum" NOT NULL DEFAULT 'BTREE', CONSTRAINT "IDX_INDEX_METADATA_NAME_WORKSPACE_ID_OBJECT_METADATA_ID_UNIQUE" UNIQUE ("name", "workspaceId", "objectMetadataId"), CONSTRAINT "PK_f73bb3c3678aee204e341f0ca4e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."indexMetadata" ("workspaceId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."indexFieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "indexMetadataId" uuid NOT NULL, "fieldMetadataId" uuid NOT NULL, "order" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5928f67e43eff7d95aa79fd96fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID" ON "core"."indexFieldMetadata" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."fieldMetadata" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standardId" uuid, "objectMetadataId" uuid NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "label" character varying NOT NULL, "defaultValue" jsonb, "description" text, "icon" character varying, "standardOverrides" jsonb, "options" jsonb, "settings" jsonb, "isCustom" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "isSystem" boolean NOT NULL DEFAULT false, "isUIReadOnly" boolean NOT NULL DEFAULT false, "isNullable" boolean DEFAULT true, "isUnique" boolean DEFAULT false, "workspaceId" uuid NOT NULL, "isLabelSyncedWithName" boolean NOT NULL DEFAULT false, "relationTargetFieldMetadataId" uuid, "relationTargetObjectMetadataId" uuid, "morphId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "REL_47a6c57e1652b6475f8248cff7" UNIQUE ("relationTargetFieldMetadataId"), CONSTRAINT "CHK_FIELD_METADATA_MORPH_RELATION_REQUIRES_MORPH_ID" CHECK (("type" != 'MORPH_RELATION') OR ("type" = 'MORPH_RELATION' AND "morphId" IS NOT NULL)), CONSTRAINT "PK_d046b1c7cea325ebc4cdc25e7a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_OBJECT_METADATA_ID" ON "core"."fieldMetadata" ("objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_WORKSPACE_ID" ON "core"."fieldMetadata" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID" ON "core"."fieldMetadata" ("objectMetadataId", "workspaceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID" ON "core"."fieldMetadata" ("relationTargetObjectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."fieldMetadata" ("relationTargetFieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilter_operand_enum" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewFilter" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "operand" "core"."viewFilter_operand_enum" NOT NULL DEFAULT 'CONTAINS', "value" jsonb NOT NULL, "viewFilterGroupId" uuid, "positionInViewFilterGroup" double precision, "subFieldName" text, "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_09f9ffa2f66263b9eb301460137" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cd4588bfc9ad73345b3953a039" ON "core"."viewFilter" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_FIELD_METADATA_ID" ON "core"."viewFilter" ("fieldMetadataId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_VIEW_ID" ON "core"."viewFilter" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID" ON "core"."viewFilter" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilterGroup_logicaloperator_enum" AS ENUM('AND', 'OR', 'NOT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewFilterGroup" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parentViewFilterGroupId" uuid, "logicalOperator" "core"."viewFilterGroup_logicaloperator_enum" NOT NULL DEFAULT 'AND', "positionInViewFilterGroup" double precision, "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_16f55359d609168b826405ed307" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e6ed40a61e4584e98584019a47" ON "core"."viewFilterGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_VIEW_ID" ON "core"."viewFilterGroup" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID" ON "core"."viewFilterGroup" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewGroup" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "fieldValue" text NOT NULL, "position" double precision NOT NULL DEFAULT '0', "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d2aa8cad01e9d5e99c23f9ccec3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a44e3b03f0eca32d0504d5ef73" ON "core"."viewGroup" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_VIEW_ID" ON "core"."viewGroup" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID" ON "core"."viewGroup" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewSort_direction_enum" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewSort" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "direction" "core"."viewSort_direction_enum" NOT NULL DEFAULT 'ASC', "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_eceb74d297f926313af6463d496" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_38232fc0c6567ed029c2b1a12c" ON "core"."viewSort" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewSort" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_VIEW_ID" ON "core"."viewSort" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID" ON "core"."viewSort" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum" AS ENUM('TABLE', 'KANBAN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_key_enum" AS ENUM('INDEX')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_openrecordin_enum" AS ENUM('SIDE_PANEL', 'RECORD_PAGE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_kanbanaggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."view" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL DEFAULT '', "objectMetadataId" uuid NOT NULL, "type" "core"."view_type_enum" NOT NULL DEFAULT 'TABLE', "key" "core"."view_key_enum", "icon" text NOT NULL, "position" double precision NOT NULL DEFAULT '0', "isCompact" boolean NOT NULL DEFAULT false, "isCustom" boolean NOT NULL DEFAULT false, "openRecordIn" "core"."view_openrecordin_enum" NOT NULL DEFAULT 'SIDE_PANEL', "kanbanAggregateOperation" "core"."view_kanbanaggregateoperation_enum", "kanbanAggregateOperationFieldMetadataId" uuid, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "anyFieldFilterValue" text, CONSTRAINT "PK_86cfb9e426c77d60b900fe2b543" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_552aa6908966e980099b3e5ebf" ON "core"."view" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."view" ("workspaceId", "objectMetadataId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewField_aggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."viewField" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fieldMetadataId" uuid NOT NULL, "isVisible" boolean NOT NULL DEFAULT true, "size" integer NOT NULL DEFAULT '0', "position" double precision NOT NULL DEFAULT '0', "aggregateOperation" "core"."viewField_aggregateoperation_enum", "viewId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ba2a5aa5f0bd7ac82788fae921e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b86af4ea24cae518dee8eae996" ON "core"."viewField" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE" ON "core"."viewField" ("fieldMetadataId", "viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_VIEW_ID" ON "core"."viewField" ("viewId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FIELD_WORKSPACE_ID_VIEW_ID" ON "core"."viewField" ("workspaceId", "viewId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetUrl" character varying NOT NULL, "operations" text array NOT NULL DEFAULT '{*.*}', "description" character varying, "secret" character varying NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_WEBHOOK_WORKSPACE_ID" ON "core"."webhook" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fullPath" character varying NOT NULL, "size" bigint NOT NULL, "type" character varying NOT NULL, "workspaceId" uuid NOT NULL, "messageId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_FILE_WORKSPACE_ID" ON "core"."file" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."agentChatMessage_role_enum" AS ENUM('user', 'assistant')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatMessage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "threadId" uuid NOT NULL, "role" "core"."agentChatMessage_role_enum" NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f54a95b34e98d94251bce37a180" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cd5b23d4e471b630137b3017ba" ON "core"."agentChatMessage" ("threadId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentChatThread" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "agentId" uuid NOT NULL, "userWorkspaceId" uuid NOT NULL, "title" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_82f67c93227868769e9553f059e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0bdc80c68a48b1f26727aabfe" ON "core"."agentChatThread" ("agentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3bd935d6f8c5ce87194b8db824" ON "core"."agentChatThread" ("userWorkspaceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standardId" uuid, "name" character varying NOT NULL, "label" character varying NOT NULL, "icon" character varying, "description" character varying, "prompt" text NOT NULL, "modelId" character varying NOT NULL DEFAULT 'auto', "responseFormat" jsonb, "workspaceId" uuid NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_1000e989398c5d4ed585cf9a46f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE" ON "core"."agent" ("name", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AGENT_ID_DELETED_AT" ON "core"."agent" ("id", "deletedAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."agentHandoff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromAgentId" uuid NOT NULL, "toAgentId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "description" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_93611f5714c0c28198616f9e83b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_AGENT_HANDOFF_FROM_TO_WORKSPACE_UNIQUE" ON "core"."agentHandoff" ("fromAgentId", "toAgentId", "workspaceId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_AGENT_HANDOFF_ID_DELETED_AT" ON "core"."agentHandoff" ("id", "deletedAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum" AS ENUM('ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."workspace" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "displayName" character varying, "logo" character varying, "inviteHash" character varying, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "allowImpersonation" boolean NOT NULL DEFAULT true, "isPublicInviteLinkEnabled" boolean NOT NULL DEFAULT true, "activationStatus" "core"."workspace_activationStatus_enum" NOT NULL DEFAULT 'INACTIVE', "metadataVersion" integer NOT NULL DEFAULT '1', "databaseUrl" character varying NOT NULL DEFAULT '', "databaseSchema" character varying NOT NULL DEFAULT '', "subdomain" character varying NOT NULL, "customDomain" character varying, "isGoogleAuthEnabled" boolean NOT NULL DEFAULT true, "isTwoFactorAuthenticationEnforced" boolean NOT NULL DEFAULT false, "isPasswordAuthEnabled" boolean NOT NULL DEFAULT true, "isMicrosoftAuthEnabled" boolean NOT NULL DEFAULT true, "isCustomDomainEnabled" boolean NOT NULL DEFAULT false, "defaultRoleId" uuid, "defaultAgentId" uuid, "version" character varying, CONSTRAINT "UQ_cba6255a24deb1fff07dd7351b8" UNIQUE ("subdomain"), CONSTRAINT "UQ_900f0a3eb789159c26c8bcb39cd" UNIQUE ("customDomain"), CONSTRAINT "onboarded_workspace_requires_default_role" CHECK ("activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "defaultRoleId" IS NOT NULL), CONSTRAINT "PK_ca86b6f9b3be5fe26d307d09b49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKSPACE_ACTIVATION_STATUS" ON "core"."workspace" ("activationStatus") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."workspaceMigration" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "migrations" jsonb, "name" character varying NOT NULL, "isCustom" boolean NOT NULL DEFAULT false, "appliedAt" TIMESTAMP WITH TIME ZONE, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_33f481ae58d08030a3a007efde1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."cronTrigger" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settings" jsonb NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serverlessFunctionId" uuid, CONSTRAINT "PK_153e054abdb2663942d4661e3bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8adc1fd6cb0dad2fbfd945954d" ON "core"."cronTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_CRON_TRIGGER_WORKSPACE_ID" ON "core"."cronTrigger" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."databaseEventTrigger" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "settings" jsonb NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serverlessFunctionId" uuid, CONSTRAINT "PK_30dd6c9713cb9dc86d75211d84c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_960465af116edf9ac501bfb3db" ON "core"."databaseEventTrigger" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID" ON "core"."databaseEventTrigger" ("workspaceId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."route_httpmethod_enum" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."route" ("universalIdentifier" uuid, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, "isAuthRequired" boolean NOT NULL DEFAULT true, "httpMethod" "core"."route_httpmethod_enum" NOT NULL DEFAULT 'GET', "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "serverlessFunctionId" uuid, CONSTRAINT "IDX_ROUTE_PATH_HTTP_METHOD_WORKSPACE_ID_UNIQUE" UNIQUE ("path", "httpMethod", "workspaceId"), CONSTRAINT "PK_08affcd076e46415e5821acf52d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1c39502392dd9cbb186deba158" ON "core"."route" ("workspaceId", "universalIdentifier") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."serverlessFunction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "latestVersion" character varying, "publishedVersions" jsonb NOT NULL DEFAULT '[]', "latestVersionInputSchema" jsonb, "runtime" character varying NOT NULL DEFAULT 'nodejs22.x', "timeoutSeconds" integer NOT NULL DEFAULT '300', "layerVersion" integer, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_4a5179975ee017934a91703247" CHECK ("timeoutSeconds" >= 1 AND "timeoutSeconds" <= 900), CONSTRAINT "PK_49bfacee064bee9d0d486483b60" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SERVERLESS_FUNCTION_ID_DELETED_AT" ON "core"."serverlessFunction" ("id", "deletedAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."remoteTable" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distantTableName" character varying NOT NULL, "localTableName" character varying NOT NULL, "workspaceId" uuid NOT NULL, "remoteServerId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_632b3858de52c8c2eb00c709b52" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."remoteServer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperId" uuid NOT NULL DEFAULT uuid_generate_v4(), "foreignDataWrapperType" text, "label" text, "foreignDataWrapperOptions" jsonb, "userMappingOptions" jsonb, "schema" text, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e5d208498fa2c9710bb934023a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayoutWidget_type_enum" AS ENUM('VIEW', 'IFRAME', 'FIELDS', 'GRAPH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayoutWidget" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pageLayoutTabId" uuid NOT NULL, "workspaceId" uuid NOT NULL, "title" character varying NOT NULL, "type" "core"."pageLayoutWidget_type_enum" NOT NULL DEFAULT 'VIEW', "objectMetadataId" uuid, "gridPosition" jsonb NOT NULL, "configuration" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2f997489b8b15cb26a0b9d4220b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID" ON "core"."pageLayoutWidget" ("workspaceId", "pageLayoutTabId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayoutTab" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "workspaceId" uuid NOT NULL, "position" double precision NOT NULL DEFAULT '0', "pageLayoutId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f1327f6ea950cdc59fe17569c5c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID" ON "core"."pageLayoutTab" ("workspaceId", "pageLayoutId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."pageLayout_type_enum" AS ENUM('RECORD_INDEX', 'RECORD_PAGE', 'DASHBOARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."pageLayout" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "workspaceId" uuid NOT NULL, "type" "core"."pageLayout_type_enum" NOT NULL DEFAULT 'RECORD_PAGE', "objectMetadataId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5028ccb46ffa0c945d2f9246dfa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."pageLayout" ("workspaceId", "objectMetadataId") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."apiKey" ADD CONSTRAINT "FK_c8b3efa54a29aa873043e72fb1d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" ADD CONSTRAINT "FK_c137e3d8b3980901e114941daa2" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorAuthenticationMethod" ADD CONSTRAINT "FK_b0f44ffd7c794beb48cb1e1b1a9" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_8cd4819144baf069777b5729136" FOREIGN KEY ("userId") REFERENCES "core"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" ADD CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" ADD CONSTRAINT "FK_73d3e340b6ce0716a25a86361fc" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" ADD CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."postgresCredentials" ADD CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" ADD CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_826052747c82e59f0a006204256" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD CONSTRAINT "FK_efbcf3528718de2b5c45c0a8a83" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" ADD CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331" FOREIGN KEY ("apiKeyId") REFERENCES "core"."apiKey"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_bbf16a91f5a10199e5b18c019ba" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_dc8e552397f5e44d175fedf752a" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_d5c47a26fe71648894d05da3d3a" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_2763aee5614b54019d692333fe1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" ADD CONSTRAINT "FK_0b19dd17369574578bc18c405b2" FOREIGN KEY ("dataSourceId") REFERENCES "core"."dataSource"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" ADD CONSTRAINT "FK_051487e9b745cb175950130b63f" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" ADD CONSTRAINT "FK_b20192c432612eb710801dd5664" FOREIGN KEY ("indexMetadataId") REFERENCES "core"."indexMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" ADD CONSTRAINT "FK_be0950612a54b58c72bd62d629e" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_de2a09b9e3e690440480d2dee26" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_47a6c57e1652b6475f8248cff78" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" ADD CONSTRAINT "FK_6f6c87ec32cca956d8be321071c" FOREIGN KEY ("relationTargetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_193548db5abc45713087f7d1af6" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_32cabc67e40d24acab541c469a8" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_06858adf0fb54ec88fa602198ca" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_b518bd61175e0963370e09ef15e" FOREIGN KEY ("viewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_dce74ab06fa7a2effcbf1b98dff" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_8919a390f4022ab1e40182a5ac3" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_6aa17342705ae5526de377bf7ed" FOREIGN KEY ("parentViewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_61053f5509cc31e5d7139fba1cb" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" ADD CONSTRAINT "FK_2d7cfc4748058a0ca648835d046" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_818522b962a9b756accb5b3149d" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_5f3278d6791aa4c58423e556ae6" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_2b36c6adea4542b4844d9fb1806" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_3e5ea41c239ef1b75b0d42bef99" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_580dad12c8b92f3a3c307c4e66d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_0a48a0b66daedac1314437be5eb" FOREIGN KEY ("fieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_96158de54c78944b5340b6f708e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_c5ab40cd4debb51d588752a4857" FOREIGN KEY ("viewId") REFERENCES "core"."view"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_597ab5e7de76f1836b8fd80d6b9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_de468b3d8dcf7e94f7074220929" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" ADD CONSTRAINT "FK_a78a68c3f577a485dd4c741909f" FOREIGN KEY ("messageId") REFERENCES "core"."agentChatMessage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6" FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD CONSTRAINT "FK_3bd935d6f8c5ce87194b8db8240" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ADD CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_7128daa5ac9f787388391b52269" FOREIGN KEY ("fromAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_020114432e51baf65bbbc46e350" FOREIGN KEY ("toAgentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" ADD CONSTRAINT "FK_7ea2d1182dc5324e7cef9903302" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" ADD CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" ADD CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" ADD CONSTRAINT "FK_c63b1110bbf09051be2f495d0be" FOREIGN KEY ("serverlessFunctionId") REFERENCES "core"."serverlessFunction"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."remoteTable" ADD CONSTRAINT "FK_3db5ae954f9197def326053f06a" FOREIGN KEY ("remoteServerId") REFERENCES "core"."remoteServer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_555948f84165dce1fe1f5f955ce" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_0659a4d171c93f5c046f18d24cd" FOREIGN KEY ("pageLayoutTabId") REFERENCES "core"."pageLayoutTab"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" ADD CONSTRAINT "FK_c4dc95034f53a12601e623d9171" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_2528e67c8c0c953d8303172989e" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD CONSTRAINT "FK_0177b1574efe6e6f24651977340" FOREIGN KEY ("pageLayoutId") REFERENCES "core"."pageLayout"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_760ec8b78721991220b76accd55" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" ADD CONSTRAINT "FK_dd63ca42614bacf58971aabdcbb" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_dd63ca42614bacf58971aabdcbb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayout" DROP CONSTRAINT "FK_760ec8b78721991220b76accd55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_0177b1574efe6e6f24651977340"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP CONSTRAINT "FK_2528e67c8c0c953d8303172989e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_c4dc95034f53a12601e623d9171"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_0659a4d171c93f5c046f18d24cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutWidget" DROP CONSTRAINT "FK_555948f84165dce1fe1f5f955ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."remoteTable" DROP CONSTRAINT "FK_3db5ae954f9197def326053f06a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."route" DROP CONSTRAINT "FK_c63b1110bbf09051be2f495d0be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."databaseEventTrigger" DROP CONSTRAINT "FK_7650f1b8b693cde204f44ab0aa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."cronTrigger" DROP CONSTRAINT "FK_f70831ec336e0cb42d6a33b80ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_7ea2d1182dc5324e7cef9903302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_020114432e51baf65bbbc46e350"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentHandoff" DROP CONSTRAINT "FK_7128daa5ac9f787388391b52269"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP CONSTRAINT "FK_c4cb56621768a4a325dd772bbe1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_3bd935d6f8c5ce87194b8db8240"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT "FK_d0bdc80c68a48b1f26727aabfe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP CONSTRAINT "FK_cd5b23d4e471b630137b3017ba6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_a78a68c3f577a485dd4c741909f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."file" DROP CONSTRAINT "FK_de468b3d8dcf7e94f7074220929"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_597ab5e7de76f1836b8fd80d6b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_c5ab40cd4debb51d588752a4857"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_96158de54c78944b5340b6f708e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_0a48a0b66daedac1314437be5eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_580dad12c8b92f3a3c307c4e66d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_3e5ea41c239ef1b75b0d42bef99"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_2b36c6adea4542b4844d9fb1806"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_5f3278d6791aa4c58423e556ae6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_818522b962a9b756accb5b3149d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_2d7cfc4748058a0ca648835d046"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_61053f5509cc31e5d7139fba1cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewGroup" DROP CONSTRAINT "FK_b3aa7ec58cdd9e83729f2232591"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_6aa17342705ae5526de377bf7ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_8919a390f4022ab1e40182a5ac3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_dce74ab06fa7a2effcbf1b98dff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_b518bd61175e0963370e09ef15e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_06858adf0fb54ec88fa602198ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_32cabc67e40d24acab541c469a8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_193548db5abc45713087f7d1af6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_6f6c87ec32cca956d8be321071c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_47a6c57e1652b6475f8248cff78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldMetadata" DROP CONSTRAINT "FK_de2a09b9e3e690440480d2dee26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" DROP CONSTRAINT "FK_be0950612a54b58c72bd62d629e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexFieldMetadata" DROP CONSTRAINT "FK_b20192c432612eb710801dd5664"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."indexMetadata" DROP CONSTRAINT "FK_051487e9b745cb175950130b63f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectMetadata" DROP CONSTRAINT "FK_0b19dd17369574578bc18c405b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_2763aee5614b54019d692333fe1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_d5c47a26fe71648894d05da3d3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_dc8e552397f5e44d175fedf752a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_bbf16a91f5a10199e5b18c019ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_915c8bcb0f861a56f793a4b8331"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT "FK_13f8ca9c517976733a1ce4c10eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_efbcf3528718de2b5c45c0a8a83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP CONSTRAINT "FK_826052747c82e59f0a006204256"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspaceSSOIdentityProvider" DROP CONSTRAINT "FK_bc8d8855198de1fbc32fba8df93"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."postgresCredentials" DROP CONSTRAINT "FK_9494639abc06f9c8c3691bf5d22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."featureFlag" DROP CONSTRAINT "FK_6be7761fa8453f3a498aab6e72b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."approvedAccessDomain" DROP CONSTRAINT "FK_73d3e340b6ce0716a25a86361fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_d6ae19a7aa2bbd4919053257772"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."appToken" DROP CONSTRAINT "FK_8cd4819144baf069777b5729136"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_22f5e76f493c3fb20237cfc48b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_a2da2ea7d6cd1e5a4c5cb1791f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."twoFactorAuthenticationMethod" DROP CONSTRAINT "FK_b0f44ffd7c794beb48cb1e1b1a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_c137e3d8b3980901e114941daa2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."keyValuePair" DROP CONSTRAINT "FK_0dae35d1c0fbdda6495be4ae71a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."apiKey" DROP CONSTRAINT "FK_c8b3efa54a29aa873043e72fb1d"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayout"`);
    await queryRunner.query(`DROP TYPE "core"."pageLayout_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayoutTab"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."pageLayoutWidget"`);
    await queryRunner.query(`DROP TYPE "core"."pageLayoutWidget_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."remoteServer"`);
    await queryRunner.query(`DROP TABLE "core"."remoteTable"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SERVERLESS_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(`DROP TABLE "core"."serverlessFunction"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_1c39502392dd9cbb186deba158"`,
    );
    await queryRunner.query(`DROP TABLE "core"."route"`);
    await queryRunner.query(`DROP TYPE "core"."route_httpmethod_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DATABASE_EVENT_TRIGGER_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_960465af116edf9ac501bfb3db"`,
    );
    await queryRunner.query(`DROP TABLE "core"."databaseEventTrigger"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_CRON_TRIGGER_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_8adc1fd6cb0dad2fbfd945954d"`,
    );
    await queryRunner.query(`DROP TABLE "core"."cronTrigger"`);
    await queryRunner.query(`DROP TABLE "core"."workspaceMigration"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_WORKSPACE_ACTIVATION_STATUS"`,
    );
    await queryRunner.query(`DROP TABLE "core"."workspace"`);
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_HANDOFF_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_HANDOFF_FROM_TO_WORKSPACE_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentHandoff"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_AGENT_ID_DELETED_AT"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agent"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_3bd935d6f8c5ce87194b8db824"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_d0bdc80c68a48b1f26727aabfe"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatThread"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd5b23d4e471b630137b3017ba"`,
    );
    await queryRunner.query(`DROP TABLE "core"."agentChatMessage"`);
    await queryRunner.query(`DROP TYPE "core"."agentChatMessage_role_enum"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_FILE_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."file"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_WEBHOOK_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."webhook"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FIELD_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_b86af4ea24cae518dee8eae996"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewField"`);
    await queryRunner.query(
      `DROP TYPE "core"."viewField_aggregateoperation_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_552aa6908966e980099b3e5ebf"`,
    );
    await queryRunner.query(`DROP TABLE "core"."view"`);
    await queryRunner.query(
      `DROP TYPE "core"."view_kanbanaggregateoperation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_openrecordin_enum"`);
    await queryRunner.query(`DROP TYPE "core"."view_key_enum"`);
    await queryRunner.query(`DROP TYPE "core"."view_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_SORT_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_SORT_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_38232fc0c6567ed029c2b1a12c"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewSort"`);
    await queryRunner.query(`DROP TYPE "core"."viewSort_direction_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_GROUP_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_GROUP_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_a44e3b03f0eca32d0504d5ef73"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewGroup"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_GROUP_VIEW_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_e6ed40a61e4584e98584019a47"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewFilterGroup"`);
    await queryRunner.query(
      `DROP TYPE "core"."viewFilterGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_WORKSPACE_ID_VIEW_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_VIEW_FILTER_VIEW_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_cd4588bfc9ad73345b3953a039"`,
    );
    await queryRunner.query(`DROP TABLE "core"."viewFilter"`);
    await queryRunner.query(`DROP TYPE "core"."viewFilter_operand_enum"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_RELATION_TARGET_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_OBJECT_METADATA_ID_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_WORKSPACE_ID"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_METADATA_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."fieldMetadata"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_FIELD_METADATA_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."indexFieldMetadata"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_INDEX_METADATA_WORKSPACE_ID_OBJECT_METADATA_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."indexMetadata"`);
    await queryRunner.query(`DROP TYPE "core"."indexMetadata_indextype_enum"`);
    await queryRunner.query(`DROP TABLE "core"."objectMetadata"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_FIELD_PERMISSION_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."fieldPermission"`);
    await queryRunner.query(`DROP TABLE "core"."role"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_ROLE_TARGETS_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_ROLE_TARGETS_AGENT_ID"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_ROLE_TARGETS_API_KEY_ID"`);
    await queryRunner.query(`DROP TABLE "core"."roleTargets"`);
    await queryRunner.query(`DROP TABLE "core"."permissionFlag"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_OBJECT_PERMISSION_WORKSPACE_ID_ROLE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."objectPermission"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_DATA_SOURCE_WORKSPACE_ID_CREATED_AT"`,
    );
    await queryRunner.query(`DROP TABLE "core"."dataSource"`);
    await queryRunner.query(`DROP TYPE "core"."dataSource_type_enum"`);
    await queryRunner.query(`DROP TABLE "core"."workspaceSSOIdentityProvider"`);
    await queryRunner.query(
      `DROP TYPE "core"."workspaceSSOIdentityProvider_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspaceSSOIdentityProvider_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "core"."postgresCredentials"`);
    await queryRunner.query(`DROP TABLE "core"."featureFlag"`);
    await queryRunner.query(`DROP TABLE "core"."approvedAccessDomain"`);
    await queryRunner.query(`DROP TABLE "core"."appToken"`);
    await queryRunner.query(`DROP INDEX "core"."UQ_USER_EMAIL"`);
    await queryRunner.query(`DROP TABLE "core"."user"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP INDEX "core"."IDX_USER_WORKSPACE_USER_ID"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_WORKSPACE_WORKSPACE_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."userWorkspace"`);
    await queryRunner.query(
      `DROP INDEX "core"."IDX_2909f5139c479e4632df03fd5e"`,
    );
    await queryRunner.query(
      `DROP TABLE "core"."twoFactorAuthenticationMethod"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."twoFactorAuthenticationMethod_strategy_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."twoFactorAuthenticationMethod_status_enum"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_WORKSPACE_ID_NULL_USER_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_KEY_VALUE_PAIR_KEY_USER_ID_NULL_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."keyValuePair"`);
    await queryRunner.query(`DROP TYPE "core"."keyValuePair_type_enum"`);
    await queryRunner.query(`DROP INDEX "core"."IDX_API_KEY_WORKSPACE_ID"`);
    await queryRunner.query(`DROP TABLE "core"."apiKey"`);
  }
}
