import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { type DataSource } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { StripDerivedRecordFilterPropertiesCommand } from 'src/database/commands/upgrade-version-command/2-48/2-48-workspace-command-1791986817506-strip-derived-record-filter-properties.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const FIELD_ID = 'company-name-field-id';

const legacyRecordFilter = {
  id: 'filter-id',
  type: 'TEXT',
  label: 'Name',
  value: '{{trigger.name}}',
  displayValue: '{{trigger.name}}',
  operand: 'CONTAINS',
  fieldMetadataId: FIELD_ID,
  recordFilterGroupId: 'group-id',
};

const persistedRecordFilter = {
  id: 'filter-id',
  value: '{{trigger.name}}',
  operand: 'CONTAINS',
  fieldMetadataId: FIELD_ID,
  recordFilterGroupId: 'group-id',
};

const buildSteps = (recordFilters: object[]) => [
  {
    id: 'find-step-id',
    type: 'FIND_RECORDS',
    settings: {
      input: {
        objectName: 'company',
        filter: {
          recordFilters,
          recordFilterGroups: [{ id: 'group-id', logicalOperator: 'AND' }],
        },
      },
    },
  },
  { id: 'code-step-id', type: 'CODE', settings: { input: {} } },
];

const buildChartConfiguration = (recordFilters: object[]) => ({
  configurationType: 'AGGREGATE_CHART',
  filter: { recordFilters, recordFilterGroups: [] },
});

type Row = { id: string; value: unknown };

type Rows = {
  workspaceWorkflowVersions?: Row[];
  workflowRuns?: Row[];
  coreWorkflowVersions?: Row[];
  chartWidgets?: Row[];
};

const setup = (rows: Rows, lockedRows: Rows = rows) => {
  const getTableRows = (sql: string, tableRows: Rows) => {
    if (sql.includes('"workflowRun"')) {
      return tableRows.workflowRuns ?? [];
    }

    if (sql.includes('core."workflowVersion"')) {
      return tableRows.coreWorkflowVersions ?? [];
    }

    if (sql.includes('"workflowVersion"')) {
      return tableRows.workspaceWorkflowVersions ?? [];
    }

    if (sql.includes('core."pageLayoutWidget"')) {
      return tableRows.chartWidgets ?? [];
    }

    return [];
  };

  const query = jest.fn(async (sql: string, parameters?: unknown[]) => {
    if (!sql.startsWith('SELECT')) {
      return [];
    }

    if (sql.includes('FOR UPDATE')) {
      return getTableRows(sql, lockedRows).filter(
        (row) => row.id === parameters?.[0],
      );
    }

    return getTableRows(sql, rows);
  });

  const transaction = jest.fn(
    async (
      runInTransaction: (manager: { query: typeof query }) => Promise<unknown>,
    ) => runInTransaction({ query }),
  );

  const workspaceCacheService = {
    getOrRecompute: jest.fn(async () => ({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.workflowVersion.universalIdentifier]: {
            universalIdentifier:
              STANDARD_OBJECTS.workflowVersion.universalIdentifier,
          },
          [STANDARD_OBJECTS.workflowRun.universalIdentifier]: {
            universalIdentifier:
              STANDARD_OBJECTS.workflowRun.universalIdentifier,
          },
        },
        universalIdentifierById: {},
        universalIdentifiersByApplicationId: {},
      },
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          'company-name-field-universal-identifier': {
            id: FIELD_ID,
            universalIdentifier: 'company-name-field-universal-identifier',
            name: 'name',
            label: 'Name',
            type: FieldMetadataType.TEXT,
          },
        },
        universalIdentifierById: {
          [FIELD_ID]: 'company-name-field-universal-identifier',
        },
        universalIdentifiersByApplicationId: {},
      },
    })),
    invalidateAndRecompute: jest.fn(),
  };

  const command = new StripDerivedRecordFilterPropertiesCommand(
    {} as WorkspaceIteratorService,
    workspaceCacheService as unknown as WorkspaceCacheService,
  );

  const args = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    dataSource: { query, transaction } as unknown as DataSource,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  const getUpdates = (table: string) =>
    query.mock.calls
      .filter(
        ([sql]) => sql.startsWith('UPDATE') && sql.includes(table),
      )
      .map(([, parameters]) => {
        const [value, id] = (parameters ?? []) as [string, string];

        return { id, value: JSON.parse(value) };
      });

  return { command, args, query, workspaceCacheService, getUpdates };
};

describe('StripDerivedRecordFilterPropertiesCommand', () => {
  it('should store Find Records and chart filters as field references only', async () => {
    const { command, args, getUpdates, workspaceCacheService } = setup({
      workspaceWorkflowVersions: [
        { id: 'version-id', value: buildSteps([legacyRecordFilter]) },
      ],
      coreWorkflowVersions: [
        { id: 'core-version-id', value: buildSteps([legacyRecordFilter]) },
      ],
      chartWidgets: [
        {
          id: 'widget-id',
          value: buildChartConfiguration([legacyRecordFilter]),
        },
      ],
    });

    await command.runOnWorkspace(args());

    expect(getUpdates('"workflowVersion"')).toEqual([
      { id: 'version-id', value: buildSteps([persistedRecordFilter]) },
      { id: 'core-version-id', value: buildSteps([persistedRecordFilter]) },
    ]);
    expect(getUpdates('core."pageLayoutWidget"')).toEqual([
      {
        id: 'widget-id',
        value: buildChartConfiguration([persistedRecordFilter]),
      },
    ]);
    expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
      WORKSPACE_ID,
      ['flatWorkflowVersionMaps', 'flatPageLayoutWidgetMaps'],
    );
  });

  it('should leave rows that are already stored as field references untouched', async () => {
    const { command, args, query, workspaceCacheService } = setup({
      workspaceWorkflowVersions: [
        { id: 'version-id', value: buildSteps([persistedRecordFilter]) },
      ],
      chartWidgets: [
        {
          id: 'widget-id',
          value: buildChartConfiguration([persistedRecordFilter]),
        },
      ],
    });

    await command.runOnWorkspace(args());

    expect(
      query.mock.calls.filter(([sql]) => sql.startsWith('UPDATE')),
    ).toHaveLength(0);
    expect(
      workspaceCacheService.invalidateAndRecompute,
    ).not.toHaveBeenCalled();
  });

  it('should rewrite the value locked at write time rather than the one first read', async () => {
    const concurrentlyAddedRecordFilter = {
      ...legacyRecordFilter,
      id: 'concurrently-added-filter-id',
    };

    const { command, args, getUpdates } = setup(
      {
        workspaceWorkflowVersions: [
          { id: 'version-id', value: buildSteps([legacyRecordFilter]) },
        ],
      },
      {
        workspaceWorkflowVersions: [
          {
            id: 'version-id',
            value: buildSteps([
              legacyRecordFilter,
              concurrentlyAddedRecordFilter,
            ]),
          },
        ],
      },
    );

    await command.runOnWorkspace(args());

    expect(getUpdates('"workflowVersion"')).toEqual([
      {
        id: 'version-id',
        value: buildSteps([
          persistedRecordFilter,
          { ...persistedRecordFilter, id: 'concurrently-added-filter-id' },
        ]),
      },
    ]);
  });

  it('should skip a row that was already rewritten when it is locked', async () => {
    const { command, args, query } = setup(
      {
        workspaceWorkflowVersions: [
          { id: 'version-id', value: buildSteps([legacyRecordFilter]) },
        ],
      },
      {
        workspaceWorkflowVersions: [
          { id: 'version-id', value: buildSteps([persistedRecordFilter]) },
        ],
      },
    );

    await command.runOnWorkspace(args());

    expect(
      query.mock.calls.filter(([sql]) => sql.startsWith('UPDATE')),
    ).toHaveLength(0);
  });

  it('should give the same id to a filter persisted without one in both workflow version copies', async () => {
    const { id: _id, ...recordFilterWithoutId } = legacyRecordFilter;
    const steps = buildSteps([
      { ...recordFilterWithoutId, value: ['ACME'] },
    ]);

    const { command, args, getUpdates } = setup({
      workspaceWorkflowVersions: [{ id: 'version-id', value: steps }],
      coreWorkflowVersions: [{ id: 'core-version-id', value: steps }],
    });

    await command.runOnWorkspace(args());

    const [workspaceUpdate, coreUpdate] = getUpdates('"workflowVersion"');
    const [workspaceRecordFilter] =
      workspaceUpdate.value[0].settings.input.filter.recordFilters;

    expect(workspaceRecordFilter).toEqual({
      ...persistedRecordFilter,
      id: expect.any(String),
      value: '["ACME"]',
    });
    expect(coreUpdate.value).toEqual(workspaceUpdate.value);
  });

  it('should rewrite the runs whose filters the Find Records schema would reject', async () => {
    const { id: _id, ...recordFilterWithoutId } = legacyRecordFilter;

    const { command, args, query, getUpdates } = setup({
      workflowRuns: [
        {
          id: 'run-id',
          value: {
            stepInfos: {},
            flow: { trigger: {}, steps: buildSteps([recordFilterWithoutId]) },
          },
        },
      ],
    });

    await command.runOnWorkspace(args());

    const [runSelect] = query.mock.calls.filter(
      ([sql]) => sql.startsWith('SELECT') && sql.includes('"workflowRun"'),
    );
    const [runUpdate] = getUpdates('"workflowRun"');

    expect(runSelect[0]).toContain('jsonb_path_exists');
    expect(runUpdate.id).toBe('run-id');
    expect(runUpdate.value.stepInfos).toEqual({});
    expect(
      runUpdate.value.flow.steps[0].settings.input.filter.recordFilters[0],
    ).toEqual({ ...persistedRecordFilter, id: expect.any(String) });
  });

  it('should not write anything in dry run', async () => {
    const { command, args, query, workspaceCacheService } = setup({
      workspaceWorkflowVersions: [
        { id: 'version-id', value: buildSteps([legacyRecordFilter]) },
      ],
      chartWidgets: [
        {
          id: 'widget-id',
          value: buildChartConfiguration([legacyRecordFilter]),
        },
      ],
    });

    await command.runOnWorkspace(args(true));

    expect(
      query.mock.calls.filter(([sql]) => sql.startsWith('UPDATE')),
    ).toHaveLength(0);
    expect(
      workspaceCacheService.invalidateAndRecompute,
    ).not.toHaveBeenCalled();
  });

  it('should restore the derived properties from field metadata on down', async () => {
    const { command, args, query, getUpdates } = setup({
      workspaceWorkflowVersions: [
        { id: 'version-id', value: buildSteps([persistedRecordFilter]) },
      ],
      chartWidgets: [
        {
          id: 'widget-id',
          value: buildChartConfiguration([persistedRecordFilter]),
        },
      ],
    });

    await command.down(args());

    expect(getUpdates('"workflowVersion"')).toEqual([
      { id: 'version-id', value: buildSteps([legacyRecordFilter]) },
    ]);
    expect(getUpdates('core."pageLayoutWidget"')).toEqual([
      {
        id: 'widget-id',
        value: buildChartConfiguration([legacyRecordFilter]),
      },
    ]);
    expect(
      query.mock.calls.filter(
        ([sql]) => sql.startsWith('SELECT') && sql.includes('"workflowRun"'),
      ),
    ).toHaveLength(0);
  });
});
