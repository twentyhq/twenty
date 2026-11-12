import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/withdrawn-currency-code.constant';
import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-filter-value.util';
import { replaceWithdrawnCurrencyCodeInJson } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-json.util';
import { replaceWithdrawnCurrencyCodeInWorkflowJson } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-workflow-json.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const WITHDRAWN_CURRENCY_CODE_PATTERN = `%${WITHDRAWN_CURRENCY_CODE}%`;

@RegisteredWorkspaceCommand('2.57.0', 1794064503000)
@Command({
  name: 'upgrade:2-57:replace-withdrawn-currency-code',
  description: `Replace the withdrawn ${WITHDRAWN_CURRENCY_CODE} currency code with ${REPLACEMENT_CURRENCY_CODE} in records, field default values, filters, chart widgets and workflows`,
})
export class ReplaceWithdrawnCurrencyCodeCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource) || options.dryRun) {
      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const currencyFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((field) => field.type === FieldMetadataType.CURRENCY);

    if (currencyFields.length === 0) {
      return;
    }

    await this.replaceInFieldDefaultValues({ workspaceId, currencyFields });
    await this.replaceInRecords({
      dataSource,
      workspaceId,
      currencyFields,
      flatObjectMetadataMaps,
    });
    await this.replaceInJsonbColumns({
      dataSource,
      workspaceId,
      flatObjectMetadataMaps,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatViewFilterMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatPageLayoutWidgetMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);
  }

  private async replaceInFieldDefaultValues({
    workspaceId,
    currencyFields,
  }: {
    workspaceId: string;
    currencyFields: FlatFieldMetadata[];
  }): Promise<void> {
    const fieldsToUpdateByApplication = new Map<string, FlatFieldMetadata[]>();

    for (const field of currencyFields) {
      if (
        !isPlainObject(field.defaultValue) ||
        !('currencyCode' in field.defaultValue) ||
        field.defaultValue.currencyCode !== `'${WITHDRAWN_CURRENCY_CODE}'`
      ) {
        continue;
      }

      fieldsToUpdateByApplication.set(field.applicationUniversalIdentifier, [
        ...(fieldsToUpdateByApplication.get(
          field.applicationUniversalIdentifier,
        ) ?? []),
        {
          ...field,
          defaultValue: {
            ...field.defaultValue,
            currencyCode: `'${REPLACEMENT_CURRENCY_CODE}'`,
          },
        },
      ]);
    }

    for (const [
      applicationUniversalIdentifier,
      flatEntityToUpdate,
    ] of fieldsToUpdateByApplication) {
      const migrationArgs = {
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate,
          },
        },
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to replace ${WITHDRAWN_CURRENCY_CODE} currency field default values`,
        );
      }
    }
  }

  private async replaceInRecords({
    dataSource,
    workspaceId,
    currencyFields,
    flatObjectMetadataMaps,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    currencyFields: FlatFieldMetadata[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<void> {
    for (const field of currencyFields) {
      const objectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          field.objectMetadataUniversalIdentifier
        ];

      if (!isDefined(objectMetadata)) {
        continue;
      }

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata,
      });
      const columnName = `${field.name}CurrencyCode`;

      await dataSource.query(
        `UPDATE "${schemaName}"."${tableName}" SET "${columnName}" = $1 WHERE "${columnName}" = $2`,
        [REPLACEMENT_CURRENCY_CODE, WITHDRAWN_CURRENCY_CODE],
      );
    }
  }

  private async replaceInJsonbColumns({
    dataSource,
    workspaceId,
    flatObjectMetadataMaps,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<void> {
    const filterRowWhereClause = `"workspaceId" = $1 AND "subFieldName" = 'currencyCode' AND value::text LIKE $2`;
    const coreParameters = [workspaceId, WITHDRAWN_CURRENCY_CODE_PATTERN];

    const workflowVersionObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });
    const workspaceWorkflowVersionContext = isDefined(
      workflowVersionObjectMetadata,
    )
      ? getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: workflowVersionObjectMetadata,
        })
      : undefined;
    const workspaceWorkflowVersionTableName = isDefined(
      workspaceWorkflowVersionContext,
    )
      ? `"${workspaceWorkflowVersionContext.schemaName}"."${workspaceWorkflowVersionContext.tableName}"`
      : undefined;

    const rewrites = [
      {
        tableName: 'core."viewFilter"',
        columnName: 'value',
        whereClause: filterRowWhereClause,
        whereParameters: coreParameters,
        replace: replaceWithdrawnCurrencyCodeInFilterValue,
      },
      {
        tableName: 'core."rowLevelPermissionPredicate"',
        columnName: 'value',
        whereClause: filterRowWhereClause,
        whereParameters: coreParameters,
        replace: replaceWithdrawnCurrencyCodeInFilterValue,
      },
      {
        tableName: 'core."pageLayoutWidget"',
        columnName: 'configuration',
        whereClause: `"workspaceId" = $1 AND configuration::text LIKE $2`,
        whereParameters: coreParameters,
        replace: replaceWithdrawnCurrencyCodeInJson,
      },
      ...['steps', 'triggers'].map((columnName) => ({
        tableName: 'core."workflowVersion"',
        columnName,
        whereClause: `"workspaceId" = $1 AND ${columnName}::text LIKE $2`,
        whereParameters: coreParameters,
        replace: replaceWithdrawnCurrencyCodeInWorkflowJson,
      })),
      ...(isDefined(workspaceWorkflowVersionTableName)
        ? ['steps', 'trigger'].map((columnName) => ({
            tableName: workspaceWorkflowVersionTableName,
            columnName,
            whereClause: `${columnName}::text LIKE $1`,
            whereParameters: [WITHDRAWN_CURRENCY_CODE_PATTERN],
            replace: replaceWithdrawnCurrencyCodeInWorkflowJson,
          }))
        : []),
    ];

    for (const { replace, ...rewrite } of rewrites) {
      await rewriteJsonbRowsWithCompareAndSet<unknown>({
        ...rewrite,
        dataSource,
        isDryRun: false,
        mapRow: ({ value }) => {
          const replacedValue = replace(value);

          return {
            value: replacedValue,
            hasChanged: JSON.stringify(value) !== JSON.stringify(replacedValue),
          };
        },
      });
    }
  }
}
