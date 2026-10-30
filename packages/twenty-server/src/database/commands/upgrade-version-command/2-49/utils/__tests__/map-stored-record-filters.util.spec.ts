import {
  mapChartWidgetRecordFilters,
  mapFindRecordsStepRecordFilters,
  mapWorkflowRunStateRecordFilters,
} from 'src/database/commands/upgrade-version-command/2-49/utils/map-stored-record-filters.util';

const labelledRecordFilter = {
  id: 'filter-id',
  label: 'Name',
  fieldMetadataId: 'field-id',
  operand: 'CONTAINS',
  value: 'a',
};

const { label: _label, ...unlabelledRecordFilter } = labelledRecordFilter;

const dropLabel = ({
  recordFilter,
}: {
  recordFilter: Record<string, unknown>;
}) => {
  const { label: _recordFilterLabel, ...rest } = recordFilter;

  return rest;
};

const buildSteps = (recordFilters: object[]) => [
  {
    id: 'find-step-id',
    type: 'FIND_RECORDS',
    settings: { input: { objectName: 'company', filter: { recordFilters } } },
  },
  {
    id: 'code-step-id',
    type: 'CODE',
    settings: { input: { filter: { recordFilters } } },
  },
];

describe('mapFindRecordsStepRecordFilters', () => {
  it('should map the filters of Find Records steps only', () => {
    expect(
      mapFindRecordsStepRecordFilters({
        steps: buildSteps([labelledRecordFilter]),
        mapRecordFilter: dropLabel,
      }),
    ).toEqual({
      value: [
        buildSteps([unlabelledRecordFilter])[0],
        buildSteps([labelledRecordFilter])[1],
      ],
      hasChanged: true,
    });
  });

  it('should return the steps untouched when no filter changes', () => {
    const steps = buildSteps([unlabelledRecordFilter]);

    const result = mapFindRecordsStepRecordFilters({
      steps,
      mapRecordFilter: dropLabel,
    });

    expect(result.hasChanged).toBe(false);
    expect(result.value).toBe(steps);
  });
});

describe('mapWorkflowRunStateRecordFilters', () => {
  it('should map the filters of the run flow and keep the rest of the state', () => {
    expect(
      mapWorkflowRunStateRecordFilters({
        state: {
          stepInfos: { 'find-step-id': { status: 'SUCCESS' } },
          flow: { trigger: {}, steps: buildSteps([labelledRecordFilter]) },
        },
        mapRecordFilter: dropLabel,
      }),
    ).toEqual({
      value: {
        stepInfos: { 'find-step-id': { status: 'SUCCESS' } },
        flow: {
          trigger: {},
          steps: [
            buildSteps([unlabelledRecordFilter])[0],
            buildSteps([labelledRecordFilter])[1],
          ],
        },
      },
      hasChanged: true,
    });
  });
});

describe('mapChartWidgetRecordFilters', () => {
  it('should map the filters of a chart configuration', () => {
    expect(
      mapChartWidgetRecordFilters({
        configuration: {
          configurationType: 'AGGREGATE_CHART',
          filter: { recordFilters: [labelledRecordFilter] },
        },
        mapRecordFilter: dropLabel,
      }),
    ).toEqual({
      value: {
        configurationType: 'AGGREGATE_CHART',
        filter: { recordFilters: [unlabelledRecordFilter] },
      },
      hasChanged: true,
    });
  });
});
