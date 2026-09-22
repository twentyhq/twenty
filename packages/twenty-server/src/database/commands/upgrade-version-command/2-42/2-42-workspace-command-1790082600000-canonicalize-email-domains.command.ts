import { Command } from 'nest-commander';
import { canonicalizeEmail, isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const BATCH_SIZE = 1000;
const FIRST_RECORD_ID = '00000000-0000-0000-0000-000000000000';

type WorkspaceDataSource = NonNullable<RunOnWorkspaceArgs['dataSource']>;

type EmailsField = {
  objectNameSingular: string;
  fieldName: string;
  isUnique: boolean;
};

type EmailRow = {
  id: string;
  primaryEmail: string | null;
  additionalEmails: unknown;
};

type EmailRewrite = {
  id: string;
  primaryEmail: string | null;
  additionalEmails: unknown;
};

@RegisteredWorkspaceCommand('2.42.0', 1790082600000)
@Command({
  name: 'upgrade:2-42:canonicalize-email-domains',
  description:
    'Canonicalize stored EMAILS fields after checking unique primary email collisions',
})
export class CanonicalizeEmailDomainsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const fields = await dataSource.query<EmailsField[]>(
      `SELECT objectMetadata."nameSingular" AS "objectNameSingular",
              fieldMetadata."name" AS "fieldName",
              EXISTS (
                SELECT 1
                FROM "core"."indexMetadata" indexMetadata
                INNER JOIN "core"."indexFieldMetadata" indexFieldMetadata
                  ON indexFieldMetadata."indexMetadataId" = indexMetadata."id"
                WHERE indexMetadata."objectMetadataId" = objectMetadata."id"
                  AND indexMetadata."isUnique" = true
                  AND indexFieldMetadata."fieldMetadataId" = fieldMetadata."id"
                  AND NOT EXISTS (
                    SELECT 1
                    FROM "core"."indexFieldMetadata" otherIndexFieldMetadata
                    WHERE otherIndexFieldMetadata."indexMetadataId" = indexMetadata."id"
                      AND otherIndexFieldMetadata."id" <> indexFieldMetadata."id"
                  )
              ) AS "isUnique"
       FROM "core"."fieldMetadata" fieldMetadata
       INNER JOIN "core"."objectMetadata" objectMetadata
         ON objectMetadata."id" = fieldMetadata."objectMetadataId"
       WHERE fieldMetadata."workspaceId" = $1
         AND fieldMetadata."type" = 'EMAILS'
         AND fieldMetadata."isActive" = true
         AND objectMetadata."isActive" = true`,
      [workspaceId],
    );

    const existingFields: EmailsField[] = [];

    for (const field of fields) {
      const [table] = await dataSource.query<{ exists: boolean }[]>(
        'SELECT to_regclass($1) IS NOT NULL AS "exists"',
        [`${escapeIdentifier(schemaName)}.${escapeIdentifier(field.objectNameSingular)}`],
      );

      if (table?.exists) {
        existingFields.push(field);
      }
    }

    // The existing index compares raw text, so preflight every unique field before any writes.
    for (const field of existingFields.filter((candidate) => candidate.isUnique)) {
      await this.assertNoCanonicalPrimaryEmailCollisions({
        dataSource,
        schemaName,
        field,
        workspaceId,
      });
    }

    for (const field of existingFields) {
      let afterRecordId = FIRST_RECORD_ID;
      let updatedCount = 0;

      for (;;) {
        const rows = await this.findNextRows({
          dataSource,
          schemaName,
          field,
          afterRecordId,
        });

        if (rows.length === 0) {
          break;
        }

        afterRecordId = rows[rows.length - 1].id;

        const rewrites = rows
          .map((row) => this.computeRewrite(row))
          .filter((rewrite): rewrite is EmailRewrite => isDefined(rewrite));

        updatedCount += rewrites.length;

        if (rewrites.length > 0 && !options.dryRun) {
          const tableName = `${escapeIdentifier(schemaName)}.${escapeIdentifier(field.objectNameSingular)}`;
          const primaryColumn = escapeIdentifier(`${field.fieldName}PrimaryEmail`);
          const additionalColumn = escapeIdentifier(`${field.fieldName}AdditionalEmails`);

          await dataSource.query(
            `UPDATE ${tableName} AS record
             SET ${primaryColumn} = updates."primaryEmail",
                 ${additionalColumn} = updates."additionalEmails"
             FROM jsonb_to_recordset($1::jsonb) AS updates(
               "id" uuid, "primaryEmail" text, "additionalEmails" jsonb
             )
             WHERE record."id" = updates."id"`,
            [JSON.stringify(rewrites)],
          );
        }

        if (rows.length < BATCH_SIZE) {
          break;
        }
      }

      if (updatedCount > 0) {
        this.logger.log(
          `${options.dryRun ? '[DRY RUN] ' : ''}Canonicalized ${updatedCount} email record(s) in ${field.objectNameSingular}.${field.fieldName} for workspace ${workspaceId}`,
        );
      }
    }
  }

  private async assertNoCanonicalPrimaryEmailCollisions({
    dataSource,
    schemaName,
    field,
    workspaceId,
  }: {
    dataSource: WorkspaceDataSource;
    schemaName: string;
    field: EmailsField;
    workspaceId: string;
  }): Promise<void> {
    const recordIdByEmail = new Map<string, string>();
    let afterRecordId = FIRST_RECORD_ID;

    for (;;) {
      const rows = await this.findNextRows({
        dataSource,
        schemaName,
        field,
        afterRecordId,
      });

      if (rows.length === 0) {
        break;
      }

      afterRecordId = rows[rows.length - 1].id;

      for (const row of rows) {
        if (!row.primaryEmail) {
          continue;
        }

        const canonicalEmail = canonicalizeEmail(row.primaryEmail);
        const existingRecordId = recordIdByEmail.get(canonicalEmail);

        if (isDefined(existingRecordId)) {
          throw new Error(
            `Canonical email collision in workspace ${workspaceId}, ${field.objectNameSingular}.${field.fieldName}: records ${existingRecordId} and ${row.id} both map to ${canonicalEmail}. Merge or correct these records before rerunning the upgrade.`,
          );
        }

        recordIdByEmail.set(canonicalEmail, row.id);
      }

      if (rows.length < BATCH_SIZE) {
        break;
      }
    }
  }

  private async findNextRows({
    dataSource,
    schemaName,
    field,
    afterRecordId,
  }: {
    dataSource: WorkspaceDataSource;
    schemaName: string;
    field: EmailsField;
    afterRecordId: string;
  }): Promise<EmailRow[]> {
    const tableName = `${escapeIdentifier(schemaName)}.${escapeIdentifier(field.objectNameSingular)}`;
    const primaryColumn = escapeIdentifier(`${field.fieldName}PrimaryEmail`);
    const additionalColumn = escapeIdentifier(`${field.fieldName}AdditionalEmails`);

    return dataSource.query<EmailRow[]>(
      `SELECT "id", ${primaryColumn} AS "primaryEmail",
              ${additionalColumn} AS "additionalEmails"
       FROM ${tableName}
       WHERE "id" > $1::uuid
       ORDER BY "id"
       LIMIT $2`,
      [afterRecordId, BATCH_SIZE],
    );
  }

  private computeRewrite(row: EmailRow): EmailRewrite | null {
    const primaryEmail = row.primaryEmail
      ? canonicalizeEmail(row.primaryEmail)
      : row.primaryEmail;
    const additionalEmails = Array.isArray(row.additionalEmails)
      ? row.additionalEmails.map((email) =>
          typeof email === 'string' ? canonicalizeEmail(email) : email,
        )
      : row.additionalEmails;

    if (
      primaryEmail === row.primaryEmail &&
      JSON.stringify(additionalEmails) === JSON.stringify(row.additionalEmails)
    ) {
      return null;
    }

    return { id: row.id, primaryEmail, additionalEmails };
  }
}
