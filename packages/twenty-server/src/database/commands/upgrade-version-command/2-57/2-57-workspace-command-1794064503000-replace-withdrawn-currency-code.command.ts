import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/withdrawn-currency-code.constant';
import { WORKFLOW_STEP_TYPES_WITH_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-57/constants/workflow-step-types-with-currency-code.constant';
import { replaceWithdrawnCurrencyCodeInChartConfiguration } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-chart-configuration.util';
import { replaceWithdrawnCurrencyCodeInDefaultValue } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-default-value.util';
import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-filter-value.util';
import { replaceWithdrawnCurrencyCodeInWorkflowSteps } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-workflow-steps.util';
import { replaceWithdrawnCurrencyCodeInWorkflowTrigger } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-workflow-trigger.util';
import { replaceWithdrawnCurrencyCodeInWorkflowTriggers } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-workflow-triggers.util';
import {
  rewriteJsonbRowsWithCompareAndSet,
  type StoredJsonbRow,
} from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const MAX_REWRITE_ATTEMPTS = 3;

type RewriteRowsArgs = Parameters<
  typeof rewriteJsonbRowsWithCompareAndSet<unknown>
>[0];

@RegisteredWorkspaceCommand('2.57.0', 1794064503000)
@Command({
  name: 'upgrade:2-57:replace-withdrawn-currency-code',
  description: `Replace the withdrawn ${WITHDRAWN_CURRENCY_CODE} currency code with ${REPLACEMENT_CURRENCY_CODE} in currency records, field default values, view filters, row level permission predicates, chart widgets and workflow steps and triggers`,
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
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const currencyFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((field) => field.type === FieldMetadataType.CURRENCY);

    if (currencyFlatFieldMetadatas.length === 0) {
      return;
    }

    const currencyFieldMetadataIds = new Set(
      currencyFlatFieldMetadatas.map((field) => field.id),
    );

    const currencyFieldNamesByObjectNameSingular = new Map<
      string,
      Set<string>
    >();

    for (const field of currencyFlatFieldMetadatas) {
      const { nameSingular: objectNameSingular } =
        this.getFlatObjectMetadataOrThrow({
          field,
          flatObjectMetadataMaps,
          workspaceId,
        });

      const currencyFieldNames =
        currencyFieldNamesByObjectNameSingular.get(objectNameSingular) ??
        new Set<string>();

      currencyFieldNames.add(field.name);
      currencyFieldNamesByObjectNameSingular.set(
        objectNameSingular,
        currencyFieldNames,
      );
    }

    const fieldDefaultValueCount = await this.replaceInFieldDefaultValues({
      workspaceId,
      isDryRun,
      currencyFlatFieldMetadatas,
    });

    const recordCount = await this.replaceInRecords({
      dataSource,
      isDryRun,
      workspaceId,
      currencyFlatFieldMetadatas,
      flatObjectMetadataMaps,
    });

    const mapWorkflowVersionStepsRow = ({ value }: StoredJsonbRow<unknown>) =>
      replaceWithdrawnCurrencyCodeInWorkflowSteps({
        steps: value,
        currencyFieldMetadataIds,
        currencyFieldNamesByObjectNameSingular,
      });

    const workflowStepTypeContainments =
      WORKFLOW_STEP_TYPES_WITH_CURRENCY_CODE.map((type) =>
        JSON.stringify([{ type }]),
      );

    const {
      viewFilterCount,
      rowLevelPermissionPredicateCount,
      chartWidgetCount,
      coreWorkflowVersionCount,
      coreWorkflowVersionTriggersCount,
    } = await this.replaceInCachedCoreRows({
      dataSource,
      isDryRun,
      workspaceId,
      currencyFieldMetadataIds,
      workflowStepTypeContainments,
      mapWorkflowVersionStepsRow,
    });

    const {
      stepCount: workspaceWorkflowVersionCount,
      triggerCount: workspaceWorkflowVersionTriggerCount,
    } = await this.replaceInWorkspaceWorkflowVersions({
      dataSource,
      isDryRun,
      workspaceId,
      flatObjectMetadataMaps,
      workflowStepTypeContainments,
      mapWorkflowVersionStepsRow,
      currencyFieldMetadataIds,
    });

    if (
      fieldDefaultValueCount +
        recordCount +
        viewFilterCount +
        rowLevelPermissionPredicateCount +
        chartWidgetCount +
        coreWorkflowVersionCount +
        coreWorkflowVersionTriggersCount +
        workspaceWorkflowVersionCount +
        workspaceWorkflowVersionTriggerCount >
      0
    ) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Replaced ${WITHDRAWN_CURRENCY_CODE} with ${REPLACEMENT_CURRENCY_CODE} in workspace ${workspaceId}: ${fieldDefaultValueCount} field default value(s), ${recordCount} record(s), ${viewFilterCount} view filter(s), ${rowLevelPermissionPredicateCount} row level permission predicate(s), ${chartWidgetCount} chart widget(s), ${coreWorkflowVersionCount} core workflow version step(s), ${coreWorkflowVersionTriggersCount} core workflow version trigger(s), ${workspaceWorkflowVersionCount} workflow version step(s), ${workspaceWorkflowVersionTriggerCount} workflow version trigger(s)`,
      );
    }
  }

  private async replaceInCachedCoreRows({
    dataSource,
    isDryRun,
    workspaceId,
    currencyFieldMetadataIds,
    workflowStepTypeContainments,
    mapWorkflowVersionStepsRow,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    workspaceId: string;
    currencyFieldMetadataIds: Set<string>;
    workflowStepTypeContainments: string[];
    mapWorkflowVersionStepsRow: RewriteRowsArgs['mapRow'];
  }) {
    // Refresh even on failure or a no-op rerun, as earlier runs may have committed rewrites
    try {
      const mapStoredRecordFilterRow = ({ value }: StoredJsonbRow<unknown>) =>
        replaceWithdrawnCurrencyCodeInFilterValue(value);

      const recordFilterWhereClause = `"workspaceId" = $1 AND "subFieldName" = 'currencyCode' AND jsonb_typeof(value) IN ('string', 'array')`;
      const recordFilterWhereParameters = [
        workspaceId,
        [...currencyFieldMetadataIds],
      ];

      const viewFilterCount = await this.rewriteRowsOrThrow({
        dataSource,
        isDryRun,
        tableName: 'core."viewFilter"',
        columnName: 'value',
        whereClause: `${recordFilterWhereClause} AND COALESCE("relationTargetFieldMetadataId", "fieldMetadataId") = ANY($2::uuid[])`,
        whereParameters: recordFilterWhereParameters,
        mapRow: mapStoredRecordFilterRow,
      });

      const rowLevelPermissionPredicateCount = await this.rewriteRowsOrThrow({
        dataSource,
        isDryRun,
        tableName: 'core."rowLevelPermissionPredicate"',
        columnName: 'value',
        whereClause: `${recordFilterWhereClause} AND "fieldMetadataId" = ANY($2::uuid[])`,
        whereParameters: recordFilterWhereParameters,
        mapRow: mapStoredRecordFilterRow,
      });

      const chartWidgetCount = await this.rewriteRowsOrThrow({
        dataSource,
        isDryRun,
        tableName: 'core."pageLayoutWidget"',
        columnName: 'configuration',
        whereClause: `"workspaceId" = $1 AND configuration -> 'filter' -> 'recordFilters' IS NOT NULL`,
        whereParameters: [workspaceId],
        mapRow: ({ value }) =>
          replaceWithdrawnCurrencyCodeInChartConfiguration({
            configuration: value,
            currencyFieldMetadataIds,
          }),
      });

      const coreWorkflowVersionCount = await this.rewriteRowsOrThrow({
        dataSource,
        isDryRun,
        tableName: 'core."workflowVersion"',
        columnName: 'steps',
        whereClause: `"workspaceId" = $1 AND steps @> ANY($2::jsonb[])`,
        whereParameters: [workspaceId, workflowStepTypeContainments],
        mapRow: mapWorkflowVersionStepsRow,
      });

      const coreWorkflowVersionTriggersCount = await this.rewriteRowsOrThrow({
        dataSource,
        isDryRun,
        tableName: 'core."workflowVersion"',
        columnName: 'triggers',
        whereClause: `"workspaceId" = $1 AND triggers @> $2::jsonb`,
        whereParameters: [
          workspaceId,
          JSON.stringify([{ type: WorkflowTriggerType.DATABASE_EVENT }]),
        ],
        mapRow: ({ value }) =>
          replaceWithdrawnCurrencyCodeInWorkflowTriggers({
            triggers: value,
            currencyFieldMetadataIds,
          }),
      });

      return {
        viewFilterCount,
        rowLevelPermissionPredicateCount,
        chartWidgetCount,
        coreWorkflowVersionCount,
        coreWorkflowVersionTriggersCount,
      };
    } finally {
      if (!isDryRun) {
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatViewFilterMaps',
          'flatRowLevelPermissionPredicateMaps',
          'flatPageLayoutWidgetMaps',
          'flatWorkflowVersionMaps',
          'workflowAutomatedTriggerMaps',
        ]);
      }
    }
  }

  private async replaceInWorkspaceWorkflowVersions({
    dataSource,
    isDryRun,
    workspaceId,
    flatObjectMetadataMaps,
    workflowStepTypeContainments,
    mapWorkflowVersionStepsRow,
    currencyFieldMetadataIds,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workflowStepTypeContainments: string[];
    mapWorkflowVersionStepsRow: RewriteRowsArgs['mapRow'];
    currencyFieldMetadataIds: Set<string>;
  }): Promise<{ stepCount: number; triggerCount: number }> {
    const workflowVersionFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      });

    if (!isDefined(workflowVersionFlatObjectMetadata)) {
      return { stepCount: 0, triggerCount: 0 };
    }

    const { schemaName, tableName: workflowVersionTableName } =
      getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: workflowVersionFlatObjectMetadata,
      });
    const tableName = `"${schemaName}"."${workflowVersionTableName}"`;

    const stepCount = await this.rewriteRowsOrThrow({
      dataSource,
      isDryRun,
      tableName,
      columnName: 'steps',
      whereClause: `steps @> ANY($1::jsonb[])`,
      whereParameters: [workflowStepTypeContainments],
      mapRow: mapWorkflowVersionStepsRow,
    });

    const triggerCount = await this.rewriteRowsOrThrow({
      dataSource,
      isDryRun,
      tableName,
      columnName: 'trigger',
      whereClause: `trigger @> $1::jsonb`,
      whereParameters: [
        JSON.stringify({ type: WorkflowTriggerType.DATABASE_EVENT }),
      ],
      mapRow: ({ value }) =>
        replaceWithdrawnCurrencyCodeInWorkflowTrigger({
          trigger: value,
          currencyFieldMetadataIds,
        }),
    });

    return { stepCount, triggerCount };
  }

  private async replaceInFieldDefaultValues({
    workspaceId,
    isDryRun,
    currencyFlatFieldMetadatas,
  }: {
    workspaceId: string;
    isDryRun: boolean;
    currencyFlatFieldMetadatas: FlatFieldMetadata[];
  }): Promise<number> {
    const flatFieldMetadatasToUpdateByApplication = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const field of currencyFlatFieldMetadatas) {
      const { value: defaultValue, hasChanged } =
        replaceWithdrawnCurrencyCodeInDefaultValue(field.defaultValue);

      if (!hasChanged) {
        continue;
      }

      const flatFieldMetadatasToUpdate =
        flatFieldMetadatasToUpdateByApplication.get(
          field.applicationUniversalIdentifier,
        ) ?? [];

      flatFieldMetadatasToUpdate.push({ ...field, defaultValue });
      flatFieldMetadatasToUpdateByApplication.set(
        field.applicationUniversalIdentifier,
        flatFieldMetadatasToUpdate,
      );
    }

    let updatedFieldCount = 0;

    for (const [
      applicationUniversalIdentifier,
      flatFieldMetadatasToUpdate,
    ] of flatFieldMetadatasToUpdateByApplication) {
      updatedFieldCount += flatFieldMetadatasToUpdate.length;

      if (isDryRun) {
        continue;
      }

      const result = await this.updateFieldMetadatas({
        workspaceId,
        applicationUniversalIdentifier,
        flatFieldMetadatasToUpdate,
      });

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to replace ${WITHDRAWN_CURRENCY_CODE} currency field default values`,
        );
      }
    }

    return updatedFieldCount;
  }

  private async replaceInRecords({
    dataSource,
    isDryRun,
    workspaceId,
    currencyFlatFieldMetadatas,
    flatObjectMetadataMaps,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    workspaceId: string;
    currencyFlatFieldMetadatas: FlatFieldMetadata[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  }): Promise<number> {
    const currencyCodeProperty = compositeTypeDefinitions
      .get(FieldMetadataType.CURRENCY)
      ?.properties.find((property) => property.name === 'currencyCode');

    if (!isDefined(currencyCodeProperty)) {
      return 0;
    }

    const currencyCodeColumnNamesByTableName = new Map<string, string[]>();

    for (const field of currencyFlatFieldMetadatas) {
      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: this.getFlatObjectMetadataOrThrow({
          field,
          flatObjectMetadataMaps,
          workspaceId,
        }),
      });
      const qualifiedTableName = `"${schemaName}"."${tableName}"`;
      const columnNames =
        currencyCodeColumnNamesByTableName.get(qualifiedTableName) ?? [];

      columnNames.push(
        `"${computeCompositeColumnName(field, currencyCodeProperty)}"`,
      );
      currencyCodeColumnNamesByTableName.set(qualifiedTableName, columnNames);
    }

    let recordCount = 0;

    for (const [
      qualifiedTableName,
      columnNames,
    ] of currencyCodeColumnNamesByTableName) {
      if (isDryRun) {
        const [{ count }]: { count: string }[] = await dataSource.query(
          `SELECT COUNT(*) AS count FROM ${qualifiedTableName} WHERE ${columnNames.map((columnName) => `${columnName} = $1`).join(' OR ')}`,
          [WITHDRAWN_CURRENCY_CODE],
        );

        recordCount += Number(count);

        continue;
      }

      const [, updatedRowCount]: [unknown, number] = await dataSource.query(
        `UPDATE ${qualifiedTableName} SET ${columnNames.map((columnName) => `${columnName} = CASE WHEN ${columnName} = $2 THEN $1 ELSE ${columnName} END`).join(', ')} WHERE ${columnNames.map((columnName) => `${columnName} = $2`).join(' OR ')}`,
        [REPLACEMENT_CURRENCY_CODE, WITHDRAWN_CURRENCY_CODE],
      );

      recordCount += updatedRowCount;
    }

    return recordCount;
  }

  private async updateFieldMetadatas({
    workspaceId,
    applicationUniversalIdentifier,
    flatFieldMetadatasToUpdate,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatFieldMetadatasToUpdate: FlatFieldMetadata[];
  }) {
    const migrationArgs = {
      allFlatEntityOperationByMetadataName: {
        fieldMetadata: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: flatFieldMetadatasToUpdate,
        },
      },
      workspaceId,
      isSystemBuild: true,
      applicationUniversalIdentifier,
    };

    if (
      applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        migrationArgs,
      );
    }

    return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      migrationArgs,
    );
  }

  private getFlatObjectMetadataOrThrow({
    field,
    flatObjectMetadataMaps,
    workspaceId,
  }: {
    field: Pick<FlatFieldMetadata, 'id' | 'objectMetadataUniversalIdentifier'>;
    flatObjectMetadataMaps: Pick<
      FlatEntityMaps<FlatObjectMetadata>,
      'byUniversalIdentifier'
    >;
    workspaceId: string;
  }): FlatObjectMetadata {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        field.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      throw new Error(
        `Object metadata of currency field ${field.id} is missing in workspace ${workspaceId}`,
      );
    }

    return flatObjectMetadata;
  }

  // Compare-and-set skips rows edited mid-run, so re-read until none hold the withdrawn code
  private async rewriteRowsOrThrow(args: RewriteRowsArgs): Promise<number> {
    let rewrittenRowCount = 0;
    let remainingRowCount = 0;

    for (let attempt = 0; attempt < MAX_REWRITE_ATTEMPTS; attempt++) {
      rewrittenRowCount += await rewriteJsonbRowsWithCompareAndSet(args);

      if (args.isDryRun) {
        return rewrittenRowCount;
      }

      remainingRowCount = await rewriteJsonbRowsWithCompareAndSet({
        ...args,
        isDryRun: true,
      });

      if (remainingRowCount === 0) {
        return rewrittenRowCount;
      }
    }

    throw new Error(
      `${remainingRowCount} row(s) of ${args.tableName}.${args.columnName} kept changing during the upgrade and still contain ${WITHDRAWN_CURRENCY_CODE}`,
    );
  }
}
