import { createRecordPermissionIndex } from 'src/engine/core-modules/record-permission/utils/create-record-permission-index.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { escapeLiteral } from 'pg';
import { RECORD_PERMISSION_ACCESS_COLUMNS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { type RecordPermissionMetadata } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const installRecordPermissionStorage = async ({
  database,
  schemaName,
  metadata,
}: {
  database: RecordPermissionDatabase;
  schemaName: string;
  metadata: RecordPermissionMetadata;
}): Promise<void> => {
  const schema = escapeIdentifier(schemaName);

  await database.query(`
    CREATE TABLE IF NOT EXISTS ${schema}."recordPermissionState" (
      id boolean PRIMARY KEY DEFAULT true CHECK (id),
      "activeRevisionId" uuid, "candidateRevisionId" uuid, "bindingGeneration" bigint NOT NULL DEFAULT 0, "metadataFingerprint" text
    );
    ALTER TABLE ${schema}."recordPermissionState" ADD COLUMN IF NOT EXISTS "metadataFingerprint" text;
    INSERT INTO ${schema}."recordPermissionState" (id) VALUES (true) ON CONFLICT DO NOTHING;
    CREATE TABLE IF NOT EXISTS ${schema}."recordPermissionWork" (
      "revisionId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "recordId" uuid NOT NULL,
      generation bigint NOT NULL DEFAULT 1, snapshots jsonb NOT NULL DEFAULT '[]',
      "requiresRebuild" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY ("revisionId", "objectMetadataId", "recordId")
    );
    CREATE INDEX IF NOT EXISTS "IDX_PERMISSION_WORK_ORDER" ON ${schema}."recordPermissionWork" ("revisionId", "createdAt");
    CREATE TABLE IF NOT EXISTS ${schema}."recordPermissionScan" (
      "revisionId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL,
      "blockCursor" bigint NOT NULL DEFAULT 0, "tupleCursor" integer NOT NULL DEFAULT 0, "blockLimit" bigint, "relationFileNode" oid,
      processed bigint NOT NULL DEFAULT 0, complete boolean NOT NULL DEFAULT false,
      "completedAt" timestamptz,
      PRIMARY KEY ("revisionId", "objectMetadataId")
    );
    ALTER TABLE ${schema}."recordPermissionScan" ADD COLUMN IF NOT EXISTS "completedAt" timestamptz;
    ALTER TABLE ${schema}."recordPermissionScan" ADD COLUMN IF NOT EXISTS "blockCursor" bigint NOT NULL DEFAULT 0;
    ALTER TABLE ${schema}."recordPermissionScan" ADD COLUMN IF NOT EXISTS "tupleCursor" integer NOT NULL DEFAULT 0;
    ALTER TABLE ${schema}."recordPermissionScan" ADD COLUMN IF NOT EXISTS "blockLimit" bigint;
    ALTER TABLE ${schema}."recordPermissionScan" ADD COLUMN IF NOT EXISTS "relationFileNode" oid;
    CREATE TABLE IF NOT EXISTS ${schema}."recordPermissionAccessGroup" (
      id uuid PRIMARY KEY, "revisionId" uuid NOT NULL, definition jsonb NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "IDX_PERMISSION_GROUP_REVISION" ON ${schema}."recordPermissionAccessGroup" ("revisionId");
    CREATE TABLE IF NOT EXISTS ${schema}."recordPermissionExpansion" (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "revisionId" uuid NOT NULL,
      "fieldUniversalIdentifiers" uuid[] NOT NULL, "lookupValue" uuid NOT NULL,
      cursor uuid, "createdAt" timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "IDX_PERMISSION_EXPANSION_TARGET" ON ${schema}."recordPermissionExpansion" ("revisionId", "fieldUniversalIdentifiers", "lookupValue");
    CREATE INDEX IF NOT EXISTS "IDX_PERMISSION_EXPANSION_REVISION" ON ${schema}."recordPermissionExpansion" ("revisionId", id);
    CREATE OR REPLACE FUNCTION ${schema}."fenceRecordPermissionChange"() RETURNS trigger LANGUAGE plpgsql AS $function$
    BEGIN
      PERFORM pg_advisory_xact_lock_shared(hashtextextended(TG_TABLE_SCHEMA || ':record-permissions', 0));
      RETURN NULL;
    END $function$;
    CREATE OR REPLACE FUNCTION ${schema}."enqueueRecordPermissionChange"() RETURNS trigger LANGUAGE plpgsql AS $function$
    DECLARE source_record jsonb; target_object uuid; target_record uuid; revision uuid;
    BEGIN
      FOR source_record IN SELECT value FROM jsonb_array_elements(
        CASE WHEN TG_OP = 'INSERT' THEN jsonb_build_array(to_jsonb(NEW))
             WHEN TG_OP = 'DELETE' THEN jsonb_build_array(to_jsonb(OLD))
             ELSE jsonb_build_array(to_jsonb(OLD), to_jsonb(NEW)) END
      ) LOOP
        target_object := CASE WHEN TG_ARGV[1] = 'share' THEN (source_record->>'objectMetadataId')::uuid ELSE TG_ARGV[0]::uuid END;
        target_record := CASE WHEN TG_ARGV[1] = 'share' THEN (source_record->>'recordId')::uuid ELSE (source_record->>'id')::uuid END;
        FOR revision IN SELECT unnest(ARRAY["activeRevisionId", "candidateRevisionId"]) FROM ${schema}."recordPermissionState" LOOP
          IF revision IS NOT NULL THEN
            INSERT INTO ${schema}."recordPermissionWork" ("revisionId", "objectMetadataId", "recordId", snapshots)
            VALUES (revision, target_object, target_record, CASE WHEN TG_ARGV[1] = 'share' THEN '[]'::jsonb ELSE jsonb_build_array((SELECT jsonb_object_agg(key, value) FROM jsonb_each(source_record) WHERE key IN (SELECT jsonb_array_elements_text(TG_ARGV[3]::jsonb)))) END)
            ON CONFLICT ("revisionId", "objectMetadataId", "recordId") DO UPDATE SET
              generation = "recordPermissionWork".generation + 1,
              snapshots = CASE WHEN jsonb_array_length("recordPermissionWork".snapshots) < 32 THEN "recordPermissionWork".snapshots || EXCLUDED.snapshots ELSE "recordPermissionWork".snapshots END,
              "requiresRebuild" = "recordPermissionWork"."requiresRebuild" OR jsonb_array_length("recordPermissionWork".snapshots) >= 32;
          END IF;
        END LOOP;
      END LOOP;
      IF TG_ARGV[1] IN ('member', 'share') THEN
        UPDATE ${schema}."recordPermissionState" SET "bindingGeneration" = "bindingGeneration" + 1 WHERE id;
      END IF;
      PERFORM pg_notify('record_permission_invalidation', TG_ARGV[2]);
      RETURN NULL;
    END $function$;
  `);

  for (const object of Object.values(
    metadata.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const tableName = computeObjectTargetTable(object);
    const table = `${schema}.${escapeIdentifier(tableName)}`;
    const isShare = object.nameSingular === 'recordShare';

    if (!isShare) {
      await database.query(
        `ALTER TABLE ${table} ${Object.values(RECORD_PERMISSION_ACCESS_COLUMNS)
          .map(
            (column) =>
              `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(column)} uuid[] NOT NULL DEFAULT '{}'::uuid[]`,
          )
          .join(', ')}`,
      );
      await createRecordPermissionIndex({
        database,
        schemaName,
        indexName: `IDX_${object.id.replace(/-/g, '')}_READ_ACCESS`,
        definition: `ON ${table} USING gin ("readableByAccessGroupIds") WITH (fastupdate = off)`,
      });
    }

    const columns = await database.query(
      'SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position',
      [schemaName, tableName],
    );
    const businessColumns = columns
      .map((column) => String(column.column_name))
      .filter(
        (column) =>
          !Object.values(RECORD_PERMISSION_ACCESS_COLUMNS).some(
            (accessColumn) => accessColumn === column,
          ),
      );
    const snapshotColumns = [
      'id',
      ...Object.values(metadata.flatFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (field) =>
            field.objectMetadataId === object.id &&
            isMorphOrRelationFlatFieldMetadata(field) &&
            field.settings.relationType === RelationType.MANY_TO_ONE,
        )
        .map((field) =>
          computeMorphOrRelationFieldJoinColumnName({ name: field.name }),
        ),
    ];
    const events = `INSERT OR DELETE OR UPDATE OF ${businessColumns.map(escapeIdentifier).join(', ')}`;

    await database.query(`
      DROP TRIGGER IF EXISTS "recordPermissionFence" ON ${table};
      CREATE TRIGGER "recordPermissionFence" BEFORE ${events} ON ${table} FOR EACH STATEMENT EXECUTE FUNCTION ${schema}."fenceRecordPermissionChange"();
      DROP TRIGGER IF EXISTS "recordPermissionInvalidation" ON ${table};
      CREATE TRIGGER "recordPermissionInvalidation" AFTER ${events} ON ${table} FOR EACH ROW EXECUTE FUNCTION ${schema}."enqueueRecordPermissionChange"(${escapeLiteral(object.id)}, ${escapeLiteral(isShare ? 'share' : object.nameSingular === 'workspaceMember' ? 'member' : 'record')}, ${escapeLiteral(object.workspaceId)}, ${escapeLiteral(JSON.stringify(snapshotColumns))});
    `);
  }
};
