import { Command } from 'nest-commander';
import {
  emailsCompositeType,
  FieldMetadataType,
} from 'twenty-shared/types';
import { findOrThrow, isDefined } from 'twenty-shared/utils';
import { QueryFailedError, type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { canonicalizeEmailColumnsValue } from 'src/database/commands/upgrade-version-command/2-41/utils/canonicalize-email-columns-value.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const EMAIL_MIGRATION_BATCH_SIZE = 500;
const UNIQUE_VIOLATION_POSTGRES_CODE = '23505';
const TEMPORARY_TABLE_NAME = 'emailDomainCanonicalization';

const PRIMARY_EMAIL_PROPERTY = findOrThrow(
  emailsCompositeType.properties,
  (property) => property.name === 'primaryEmail',
);
const ADDITIONAL_EMAILS_PROPERTY = findOrThrow(
  emailsCompositeType.properties,
  (property) => property.name === 'additionalEmails',
);

type EmailRow = {
  id: string;
  primaryEmail: unknown;
  additionalEmails: unknown;
};

type EmailFieldTarget = {
  fieldMetadata: FlatFieldMetadata;
  tableName: string;
  primaryEmailColumnName: string;
  additionalEmailsColumnName: string;
  hasStandaloneUniqueIndex: boolean;
};

const serializeJsonValue = (value: unknown): string | null =>
  value === null || value === undefined ? null : JSON.stringify(value);

@RegisteredWorkspaceCommand('2.41.0', 1789154318369)
@Command({
  name: 'upgrade:2-41:canonicalize-email-domains',
  description:
    'Canonicalize domains in every workspace EMAILS field to their ASCII IDNA form.',
})
export class CanonicalizeEmailDomainsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatFieldMetadataMaps, flatIndexMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatObjectMetadataMaps',
      ]);

    const emailFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((field) => field.type === FieldMetadataType.EMAILS);

    const targets = emailFields.flatMap((fieldMetadata) => {
      const objectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          fieldMetadata.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(objectMetadata)) {
        this.logger.warn(
          `Object metadata not found for EMAILS field ${fieldMetadata.name} (${fieldMetadata.id}), skipping`,
        );

        return [];
      }

      const hasStandaloneUniqueIndex = Object.values(
        flatIndexMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .some(
          (indexMetadata) =>
            indexMetadata.isUnique &&
            indexMetadata.indexWhereClause === null &&
            indexMetadata.flatIndexFieldMetadatas.length === 1 &&
            indexMetadata.flatIndexFieldMetadatas[0]?.fieldMetadataId ===
              fieldMetadata.id &&
            [null, 'primaryEmail'].includes(
              indexMetadata.flatIndexFieldMetadatas[0]?.subFieldName ?? null,
            ),
        );

      return [
        {
          fieldMetadata,
          tableName: computeObjectTargetTable(objectMetadata),
          primaryEmailColumnName: computeCompositeColumnName(
            fieldMetadata.name,
            PRIMARY_EMAIL_PROPERTY,
          ),
          additionalEmailsColumnName: computeCompositeColumnName(
            fieldMetadata.name,
            ADDITIONAL_EMAILS_PROPERTY,
          ),
          hasStandaloneUniqueIndex,
        },
      ];
    });

    if (targets.length === 0) {
      this.logger.log(
        `No EMAILS fields found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await this.createTemporaryTable(queryRunner);

      for (const target of targets) {
        await this.canonicalizeField({
          isDryRun: options.dryRun ?? false,
          queryRunner,
          schemaName: getWorkspaceSchemaName(workspaceId),
          target,
          workspaceId,
        });
      }
    } finally {
      await queryRunner.release();
    }
  }

  private async createTemporaryTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TEMPORARY TABLE IF NOT EXISTS ${escapeIdentifier(TEMPORARY_TABLE_NAME)} (
        "recordId" uuid PRIMARY KEY,
        "primaryEmail" text,
        "additionalEmails" jsonb,
        "originalPrimaryEmail" text,
        "originalAdditionalEmails" jsonb
      ) ON COMMIT PRESERVE ROWS`,
    );
  }

  private async canonicalizeField({
    isDryRun,
    queryRunner,
    schemaName,
    target,
    workspaceId,
  }: {
    isDryRun: boolean;
    queryRunner: QueryRunner;
    schemaName: string;
    target: EmailFieldTarget;
    workspaceId: string;
  }): Promise<void> {
    await queryRunner.query(
      `TRUNCATE ${escapeIdentifier(TEMPORARY_TABLE_NAME)}`,
    );

    const tableReference = `${escapeIdentifier(schemaName)}.${escapeIdentifier(target.tableName)}`;
    const primaryEmailColumn = escapeIdentifier(
      target.primaryEmailColumnName,
    );
    const additionalEmailsColumn = escapeIdentifier(
      target.additionalEmailsColumnName,
    );
    let cursor: string | null = null;
    let changedRowCount = 0;

    while (true) {
      const rows = (await queryRunner.query(
        `SELECT "id",
                ${primaryEmailColumn} AS "primaryEmail",
                ${additionalEmailsColumn} AS "additionalEmails"
         FROM ${tableReference}
         WHERE ($1::uuid IS NULL OR "id" > $1)
           AND (${primaryEmailColumn} IS NOT NULL OR ${additionalEmailsColumn} IS NOT NULL)
         ORDER BY "id"
         LIMIT $2`,
        [cursor, EMAIL_MIGRATION_BATCH_SIZE],
      )) as EmailRow[];

      if (rows.length === 0) {
        break;
      }

      const changedRows = rows.flatMap((row) => {
        const canonicalValue = canonicalizeEmailColumnsValue(row);

        return canonicalValue.hasChanges
          ? [
              {
                ...canonicalValue,
                id: row.id,
                originalAdditionalEmails: row.additionalEmails,
                originalPrimaryEmail: row.primaryEmail,
              },
            ]
          : [];
      });

      if (changedRows.length > 0) {
        await this.stageRows(queryRunner, changedRows);
        changedRowCount += changedRows.length;
      }

      cursor = rows[rows.length - 1]?.id ?? null;
    }

    const fieldLabel = `${target.tableName}.${target.fieldMetadata.name}`;

    if (changedRowCount === 0) {
      this.logger.log(
        `Email domains already canonical for ${fieldLabel} in workspace ${workspaceId}`,
      );

      return;
    }

    if (target.hasStandaloneUniqueIndex) {
      const [{ collisionCount }] = (await queryRunner.query(
        `SELECT count(*)::int AS "collisionCount"
         FROM (
           SELECT "primaryEmail"
           FROM ${escapeIdentifier(TEMPORARY_TABLE_NAME)}
           WHERE "primaryEmail" IS NOT NULL
           GROUP BY "primaryEmail"
           HAVING count(*) > 1

           UNION ALL

           SELECT staged."primaryEmail"
           FROM ${escapeIdentifier(TEMPORARY_TABLE_NAME)} staged
           JOIN ${tableReference} existing
             ON existing.${primaryEmailColumn} = staged."primaryEmail"
            AND existing."id" <> staged."recordId"
           LIMIT 1
         ) collisions`,
      )) as Array<{ collisionCount: number }>;

      if (collisionCount > 0) {
        throw new Error(
          `Cannot canonicalize ${fieldLabel} in workspace ${workspaceId}: equivalent email values would collide under its unique index`,
        );
      }
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would canonicalize ${changedRowCount} row(s) in ${fieldLabel} for workspace ${workspaceId}`,
      );

      return;
    }

    try {
      const result = await queryRunner.query(
        `UPDATE ${tableReference} target
         SET ${primaryEmailColumn} = staged."primaryEmail",
             ${additionalEmailsColumn} = staged."additionalEmails"
         FROM ${escapeIdentifier(TEMPORARY_TABLE_NAME)} staged
         WHERE target."id" = staged."recordId"
           AND target.${primaryEmailColumn} IS NOT DISTINCT FROM staged."originalPrimaryEmail"
           AND target.${additionalEmailsColumn} IS NOT DISTINCT FROM staged."originalAdditionalEmails"`,
        undefined,
        true,
      );

      this.logger.log(
        `Canonicalized ${result.affected ?? 0} row(s) in ${fieldLabel} for workspace ${workspaceId}`,
      );
    } catch (error) {
      const postgresCode =
        error instanceof QueryFailedError
          ? (error.driverError as { code?: string } | undefined)?.code
          : undefined;

      if (postgresCode === UNIQUE_VIOLATION_POSTGRES_CODE) {
        throw new Error(
          `Cannot canonicalize ${fieldLabel} in workspace ${workspaceId}: equivalent email values conflict with an existing unique index`,
        );
      }

      throw error;
    }
  }

  private async stageRows(
    queryRunner: QueryRunner,
    rows: Array<
      EmailRow & {
        originalPrimaryEmail: unknown;
        originalAdditionalEmails: unknown;
      }
    >,
  ): Promise<void> {
    const parameters: unknown[] = [];
    const valuePlaceholders = rows.map((row, rowIndex) => {
      const parameterOffset = rowIndex * 5;

      parameters.push(
        row.id,
        row.primaryEmail,
        serializeJsonValue(row.additionalEmails),
        row.originalPrimaryEmail,
        serializeJsonValue(row.originalAdditionalEmails),
      );

      return `($${parameterOffset + 1}, $${parameterOffset + 2}, $${parameterOffset + 3}::jsonb, $${parameterOffset + 4}, $${parameterOffset + 5}::jsonb)`;
    });

    await queryRunner.query(
      `INSERT INTO ${escapeIdentifier(TEMPORARY_TABLE_NAME)}
        ("recordId", "primaryEmail", "additionalEmails", "originalPrimaryEmail", "originalAdditionalEmails")
       VALUES ${valuePlaceholders.join(', ')}`,
      parameters,
    );
  }
}
