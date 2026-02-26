import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLtvToPolicy1772000000000 implements MigrationInterface {
  name = 'AddLtvToPolicy1772000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const workspaces = await queryRunner.query(
      `SELECT w.id, w."workspaceCustomApplicationId", ds.schema as "schemaName"
       FROM core.workspace w
       JOIN core."dataSource" ds ON ds."workspaceId" = w.id
       WHERE w."deletedAt" IS NULL AND ds."isRemote" = false`,
    );

    for (const workspace of workspaces) {
      const schemaName = workspace.schemaName;

      if (!schemaName) {
        continue;
      }

      const policyTable = await this.findTableName(
        queryRunner,
        schemaName,
        'policy',
      );

      if (!policyTable) {
        continue;
      }

      // 1. Add LTV currency columns
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${policyTable}"
         ADD COLUMN IF NOT EXISTS "ltvAmountMicros" numeric`,
      );
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${policyTable}"
         ADD COLUMN IF NOT EXISTS "ltvCurrencyCode" text`,
      );

      // 2. Add field metadata for ltv (CURRENCY type, idempotent)
      await this.addFieldMetadata(queryRunner, workspace);

      // 3. Add pipeline field mappings for both HealthSherpa and Old CRM pipelines
      await this.addPipelineFieldMappings(queryRunner, workspace.id);

      // 4. Bump metadata version
      await queryRunner.query(
        `UPDATE core.workspace
         SET "metadataVersion" = "metadataVersion" + 1
         WHERE id = '${workspace.id}'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const workspaces = await queryRunner.query(
      `SELECT w.id, ds.schema as "schemaName"
       FROM core.workspace w
       JOIN core."dataSource" ds ON ds."workspaceId" = w.id
       WHERE w."deletedAt" IS NULL AND ds."isRemote" = false`,
    );

    for (const workspace of workspaces) {
      const schemaName = workspace.schemaName;

      if (!schemaName) {
        continue;
      }

      const policyTable = await this.findTableName(
        queryRunner,
        schemaName,
        'policy',
      );

      if (!policyTable) {
        continue;
      }

      // 1. Drop LTV columns
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${policyTable}"
         DROP COLUMN IF EXISTS "ltvAmountMicros"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${policyTable}"
         DROP COLUMN IF EXISTS "ltvCurrencyCode"`,
      );

      // 2. Remove field metadata
      const objectMetadata = await queryRunner.query(
        `SELECT id FROM core."objectMetadata"
         WHERE "workspaceId" = '${workspace.id}'
           AND "nameSingular" = 'policy'`,
      );

      if (objectMetadata.length > 0) {
        await queryRunner.query(
          `DELETE FROM core."fieldMetadata"
           WHERE "objectMetadataId" = '${objectMetadata[0].id}'
             AND name = 'ltv'
             AND "workspaceId" = '${workspace.id}'`,
        );
      }

      // 3. Remove pipeline field mappings
      await queryRunner.query(
        `DELETE FROM core."ingestionFieldMapping"
         WHERE "sourceFieldPath" IN ('_ltvAmountMicros', '_ltvCurrencyCode')
           AND "targetFieldName" = 'ltv'
           AND "pipelineId" IN (
             SELECT id FROM core."ingestionPipeline"
             WHERE "workspaceId" = '${workspace.id}'
           )`,
      );

      // 4. Bump metadata version
      await queryRunner.query(
        `UPDATE core.workspace
         SET "metadataVersion" = "metadataVersion" + 1
         WHERE id = '${workspace.id}'`,
      );
    }
  }

  private async findTableName(
    queryRunner: QueryRunner,
    schemaName: string,
    baseName: string,
  ): Promise<string | null> {
    const prefixed = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = '_${baseName}'
      )`,
    );

    if (prefixed[0].exists) {
      return `_${baseName}`;
    }

    const unprefixed = await queryRunner.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = '${baseName}'
      )`,
    );

    if (unprefixed[0].exists) {
      return baseName;
    }

    return null;
  }

  private async addFieldMetadata(
    queryRunner: QueryRunner,
    workspace: { id: string; workspaceCustomApplicationId: string | null },
  ): Promise<void> {
    const objectMetadata = await queryRunner.query(
      `SELECT id FROM core."objectMetadata"
       WHERE "workspaceId" = '${workspace.id}'
         AND "nameSingular" = 'policy'`,
    );

    if (objectMetadata.length === 0) {
      return;
    }

    const objectMetadataId = objectMetadata[0].id;

    // Check if field already exists
    const existing = await queryRunner.query(
      `SELECT id FROM core."fieldMetadata"
       WHERE "objectMetadataId" = '${objectMetadataId}'
         AND name = 'ltv'
         AND "workspaceId" = '${workspace.id}'`,
    );

    if (existing.length > 0) {
      return;
    }

    const appId = workspace.workspaceCustomApplicationId || null;
    const appIdClause = appId ? `'${appId}'` : 'NULL';

    await queryRunner.query(
      `INSERT INTO core."fieldMetadata" (
        id,
        "objectMetadataId",
        type,
        name,
        label,
        "defaultValue",
        description,
        icon,
        "isCustom",
        "isActive",
        "isSystem",
        "isNullable",
        "isUnique",
        "isLabelSyncedWithName",
        "workspaceId",
        "universalIdentifier",
        "applicationId",
        "createdAt",
        "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        '${objectMetadataId}',
        'CURRENCY',
        'ltv',
        'LTV',
        NULL,
        'Lifetime value — frozen commission snapshot from CarrierProduct at creation time',
        'IconCurrencyDollar',
        true,
        true,
        false,
        true,
        false,
        false,
        '${workspace.id}',
        gen_random_uuid(),
        ${appIdClause},
        NOW(),
        NOW()
      )`,
    );
  }

  private async addPipelineFieldMappings(
    queryRunner: QueryRunner,
    workspaceId: string,
  ): Promise<void> {
    // Find all policy pipelines (HealthSherpa + Old CRM)
    const pipelines = await queryRunner.query(
      `SELECT id, name FROM core."ingestionPipeline"
       WHERE "workspaceId" = '${workspaceId}'
         AND "deletedAt" IS NULL
         AND "targetObjectNameSingular" = 'policy'`,
    );

    for (const pipeline of pipelines) {
      await this.addLtvMappingsForPipeline(queryRunner, pipeline.id);
    }
  }

  private async addLtvMappingsForPipeline(
    queryRunner: QueryRunner,
    pipelineId: string,
  ): Promise<void> {
    // Check if amountMicros mapping already exists
    const existingAmount = await queryRunner.query(
      `SELECT id FROM core."ingestionFieldMapping"
       WHERE "pipelineId" = '${pipelineId}'
         AND "sourceFieldPath" = '_ltvAmountMicros'
         AND "targetFieldName" = 'ltv'`,
    );

    if (existingAmount.length > 0) {
      return;
    }

    // Get next position
    const maxPos = await queryRunner.query(
      `SELECT COALESCE(MAX(position), 0) + 1 as next_pos
       FROM core."ingestionFieldMapping"
       WHERE "pipelineId" = '${pipelineId}'`,
    );

    const nextPos = maxPos[0].next_pos;

    // _ltvAmountMicros -> ltv.amountMicros
    await queryRunner.query(
      `INSERT INTO core."ingestionFieldMapping" (
        id,
        "pipelineId",
        "sourceFieldPath",
        "targetFieldName",
        "targetCompositeSubField",
        "transform",
        "relationTargetObjectName",
        "relationMatchFieldName",
        "relationAutoCreate",
        "position"
      ) VALUES (
        gen_random_uuid(),
        '${pipelineId}',
        '_ltvAmountMicros',
        'ltv',
        'amountMicros',
        NULL,
        NULL,
        NULL,
        false,
        ${nextPos}
      )`,
    );

    // _ltvCurrencyCode -> ltv.currencyCode
    await queryRunner.query(
      `INSERT INTO core."ingestionFieldMapping" (
        id,
        "pipelineId",
        "sourceFieldPath",
        "targetFieldName",
        "targetCompositeSubField",
        "transform",
        "relationTargetObjectName",
        "relationMatchFieldName",
        "relationAutoCreate",
        "position"
      ) VALUES (
        gen_random_uuid(),
        '${pipelineId}',
        '_ltvCurrencyCode',
        'ltv',
        'currencyCode',
        NULL,
        NULL,
        NULL,
        false,
        ${nextPos + 1}
      )`,
    );
  }
}
