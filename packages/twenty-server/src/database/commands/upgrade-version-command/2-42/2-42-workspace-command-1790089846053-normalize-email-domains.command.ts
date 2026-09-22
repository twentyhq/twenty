import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { FieldMetadataType, emailsCompositeType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { normalizeEmailsSubfieldValue } from 'src/engine/core-modules/record-transformer/utils/normalize-emails-subfield-value.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const BACKFILL_BATCH_SIZE = 5000;
const UPDATE_BATCH_SIZE = 1000;
const FIRST_RECORD_ID = '00000000-0000-0000-0000-000000000000';
const CANDIDATE_TABLE = 'emailNormalizationCandidates';

type EmailRow = {
  id: string;
  primaryEmail: string | null;
  additionalEmails: unknown;
};

type EmailRewrite = EmailRow & {
  primaryChanged: boolean;
  additionalChanged: boolean;
};

@RegisteredWorkspaceCommand('2.42.0', 1790089846053)
@Command({
  name: 'upgrade:2-42:normalize-email-domains',
  description: 'Normalize stored EMAILS domains to Unicode and report unique collisions',
})
export class NormalizeEmailDomainsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const runner = dataSource.createQueryRunner('master');

    try {
      await runner.connect();

      for (const objectMetadata of Object.values(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )) {
        if (!isDefined(objectMetadata)) {
          continue;
        }

        const emailFields = getFlatFieldsFromFlatObjectMetadata(
          objectMetadata,
          flatFieldMetadataMaps,
        ).filter(
          (fieldMetadata) => fieldMetadata.type === FieldMetadataType.EMAILS,
        );

        if (emailFields.length === 0) {
          continue;
        }

        const tableName = computeObjectTargetTable(objectMetadata);
        const existingColumns = await runner.query<{ columnName: string }[]>(
          `SELECT attname AS "columnName"
FROM pg_attribute
WHERE attrelid = to_regclass($1)
  AND attnum > 0
  AND NOT attisdropped`,
          [`${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`],
        );

        if (existingColumns.length === 0) {
          continue;
        }

        const existingColumnNames = new Set(
          existingColumns.map(({ columnName }) => columnName),
        );

        for (const emailField of emailFields) {
          const primaryColumn = computeCompositeColumnName(
            emailField,
            emailsCompositeType.properties[0],
          );
          const additionalColumn = computeCompositeColumnName(
            emailField,
            emailsCompositeType.properties[1],
          );

          if (
            !existingColumnNames.has(primaryColumn) ||
            !existingColumnNames.has(additionalColumn)
          ) {
            continue;
          }

          await this.normalizeField({
            runner,
            workspaceId,
            schemaName,
            tableName,
            emailField,
            dryRun: options.dryRun ?? false,
          });
        }
      }
    } finally {
      await runner.release();
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // Unicode values remain valid email values for the previous release.
  }

  private async normalizeField({
    runner,
    workspaceId,
    schemaName,
    tableName,
    emailField,
    dryRun,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    schemaName: string;
    tableName: string;
    emailField: FlatFieldMetadata;
    dryRun: boolean;
  }): Promise<void> {
    const tableReference = `${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`;
    const primaryColumn = escapeIdentifier(
      computeCompositeColumnName(emailField, emailsCompositeType.properties[0]),
    );
    const additionalColumn = escapeIdentifier(
      computeCompositeColumnName(emailField, emailsCompositeType.properties[1]),
    );
    const candidateTable = escapeIdentifier(CANDIDATE_TABLE);

    await runner.query(`
CREATE TEMP TABLE ${candidateTable} (
  "id" uuid PRIMARY KEY,
  "primaryEmail" text,
  "additionalEmails" jsonb,
  "primaryChanged" boolean NOT NULL,
  "additionalChanged" boolean NOT NULL,
  "collision" boolean NOT NULL DEFAULT false
)
`);

    try {
      await this.stageRewrites({
        runner,
        tableReference,
        primaryColumn,
        additionalColumn,
        candidateTable,
      });

      if (emailField.isUnique) {
        await runner.query(`
UPDATE ${candidateTable} candidate
SET "collision" = true
WHERE candidate."id" IN (
  SELECT candidate."id"
  FROM ${candidateTable} candidate
  JOIN (
    SELECT "primaryEmail"
    FROM ${candidateTable}
    WHERE "primaryChanged"
    GROUP BY "primaryEmail"
    HAVING count(*) > 1
  ) duplicates ON duplicates."primaryEmail" = candidate."primaryEmail"
  WHERE candidate."primaryChanged"
  UNION
  SELECT candidate."id"
  FROM ${candidateTable} candidate
  JOIN ${tableReference} existing
    ON existing.${primaryColumn} = candidate."primaryEmail"
   AND existing."id" <> candidate."id"
  WHERE candidate."primaryChanged"
)
`);
      }

      const [counts] = await runner.query<
        {
          rewriteCount: string;
          updateCount: string;
          collisionCount: string;
        }[]
      >(`
SELECT count(*) AS "rewriteCount",
       count(*) FILTER (WHERE NOT "collision" OR "additionalChanged") AS "updateCount",
       count(*) FILTER (WHERE "collision") AS "collisionCount"
FROM ${candidateTable}
`);
      const rewriteCount = Number(counts?.rewriteCount ?? 0);
      const updateCount = Number(counts?.updateCount ?? 0);
      const collisionCount = Number(counts?.collisionCount ?? 0);

      if (rewriteCount === 0) {
        return;
      }

      if (!dryRun) {
        await this.applyRewrites({
          runner,
          tableReference,
          primaryColumn,
          additionalColumn,
          candidateTable,
        });
      }

      this.logger.log(
        `${dryRun ? '[DRY RUN] Would normalize' : 'Normalized'} ${updateCount} EMAILS value(s) in ${tableName}.${emailField.name} for workspace ${workspaceId}`,
      );

      if (collisionCount > 0) {
        const collisions = await runner.query<
          { id: string; primaryEmail: string }[]
        >(`
SELECT "id", "primaryEmail"
FROM ${candidateTable}
WHERE "collision"
ORDER BY "id"
LIMIT 20
`);

        this.logger.warn(
          `Left ${collisionCount} primary email(s) unchanged in ${tableName}.${emailField.name} for workspace ${workspaceId} because canonical Unicode would violate uniqueness; merge these records manually. Examples: ${collisions.map(({ id, primaryEmail }) => `${id}: ${primaryEmail}`).join(', ')}`,
        );
      }
    } finally {
      await runner.query(`DROP TABLE IF EXISTS ${candidateTable}`);
    }
  }

  private async stageRewrites({
    runner,
    tableReference,
    primaryColumn,
    additionalColumn,
    candidateTable,
  }: {
    runner: QueryRunner;
    tableReference: string;
    primaryColumn: string;
    additionalColumn: string;
    candidateTable: string;
  }): Promise<void> {
    let afterId = FIRST_RECORD_ID;

    for (;;) {
      const rows = await runner.query<EmailRow[]>(
        `
SELECT "id",
       ${primaryColumn} AS "primaryEmail",
       ${additionalColumn} AS "additionalEmails"
FROM ${tableReference}
WHERE "id" > $1
  AND (${primaryColumn} IS NOT NULL OR ${additionalColumn} IS NOT NULL)
ORDER BY "id"
LIMIT $2
`,
        [afterId, BACKFILL_BATCH_SIZE],
      );

      if (rows.length === 0) {
        break;
      }

      afterId = rows[rows.length - 1].id;

      const rewrites = rows.flatMap((row): EmailRewrite[] => {
        const primaryEmail = isNonEmptyString(row.primaryEmail)
          ? normalizeEmailAddress(row.primaryEmail)
          : row.primaryEmail;
        const additionalEmails = normalizeEmailsSubfieldValue(
          'additionalEmails',
          row.additionalEmails,
        );
        const primaryChanged = primaryEmail !== row.primaryEmail;
        const additionalChanged =
          JSON.stringify(additionalEmails) !==
          JSON.stringify(row.additionalEmails);

        return primaryChanged || additionalChanged
          ? [{
              id: row.id,
              primaryEmail,
              additionalEmails,
              primaryChanged,
              additionalChanged,
            }]
          : [];
      });

      if (rewrites.length > 0) {
        await runner.query(
          `
INSERT INTO ${candidateTable}
  ("id", "primaryEmail", "additionalEmails", "primaryChanged", "additionalChanged")
SELECT "id", "primaryEmail", "additionalEmails", "primaryChanged", "additionalChanged"
FROM jsonb_to_recordset($1::jsonb) AS changes(
  "id" uuid,
  "primaryEmail" text,
  "additionalEmails" jsonb,
  "primaryChanged" boolean,
  "additionalChanged" boolean
)
`,
          [JSON.stringify(rewrites)],
        );
      }

      if (rows.length < BACKFILL_BATCH_SIZE) {
        break;
      }
    }
  }

  private async applyRewrites({
    runner,
    tableReference,
    primaryColumn,
    additionalColumn,
    candidateTable,
  }: {
    runner: QueryRunner;
    tableReference: string;
    primaryColumn: string;
    additionalColumn: string;
    candidateTable: string;
  }): Promise<void> {
    let afterId = FIRST_RECORD_ID;

    for (;;) {
      const batch = await runner.query<{ id: string }[]>(
        `SELECT "id" FROM ${candidateTable} WHERE "id" > $1 ORDER BY "id" LIMIT $2`,
        [afterId, UPDATE_BATCH_SIZE],
      );

      if (batch.length === 0) {
        break;
      }

      afterId = batch[batch.length - 1].id;

      await runner.query(
        `
UPDATE ${tableReference} target
SET ${primaryColumn} = CASE
      WHEN candidate."primaryChanged" AND NOT candidate."collision"
      THEN candidate."primaryEmail" ELSE target.${primaryColumn} END,
    ${additionalColumn} = CASE
      WHEN candidate."additionalChanged"
      THEN candidate."additionalEmails" ELSE target.${additionalColumn} END
FROM ${candidateTable} candidate
WHERE target."id" = candidate."id"
  AND candidate."id" = ANY($1::uuid[])
  AND (candidate."additionalChanged" OR
       (candidate."primaryChanged" AND NOT candidate."collision"))
`,
        [batch.map(({ id }) => id)],
      );

      if (batch.length < UPDATE_BATCH_SIZE) {
        break;
      }
    }
  }
}
