import { isPlainObject } from 'twenty-shared/utils';

type StoredRecordFilter = Record<string, unknown>;

export type MapStoredRecordFilter = (args: {
  recordFilter: StoredRecordFilter;
}) => StoredRecordFilter;

const mapRecordFiltersOfFilter = ({
  filter,
  mapRecordFilter,
}: {
  filter: unknown;
  mapRecordFilter: MapStoredRecordFilter;
}): unknown => {
  if (!isPlainObject(filter) || !Array.isArray(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters.map((recordFilter) =>
      isPlainObject(recordFilter)
        ? mapRecordFilter({ recordFilter })
        : recordFilter,
    ),
  };
};

const toResult = ({
  original,
  mapped,
}: {
  original: unknown;
  mapped: unknown;
}) => {
  const hasChanged = JSON.stringify(original) !== JSON.stringify(mapped);

  return { value: hasChanged ? mapped : original, hasChanged };
};

export const mapFindRecordsStepRecordFilters = ({
  steps,
  mapRecordFilter,
}: {
  steps: unknown;
  mapRecordFilter: MapStoredRecordFilter;
}): { value: unknown; hasChanged: boolean } => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const mappedSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      step.type !== 'FIND_RECORDS' ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          filter: mapRecordFiltersOfFilter({
            filter: step.settings.input.filter,
            mapRecordFilter,
          }),
        },
      },
    };
  });

  return toResult({ original: steps, mapped: mappedSteps });
};

export const mapWorkflowRunStateRecordFilters = ({
  state,
  mapRecordFilter,
}: {
  state: unknown;
  mapRecordFilter: MapStoredRecordFilter;
}): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(state) || !isPlainObject(state.flow)) {
    return { value: state, hasChanged: false };
  }

  const { value: steps, hasChanged } = mapFindRecordsStepRecordFilters({
    steps: state.flow.steps,
    mapRecordFilter,
  });

  return hasChanged
    ? { value: { ...state, flow: { ...state.flow, steps } }, hasChanged }
    : { value: state, hasChanged };
};

export const mapChartWidgetRecordFilters = ({
  configuration,
  mapRecordFilter,
}: {
  configuration: unknown;
  mapRecordFilter: MapStoredRecordFilter;
}): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration) || !('filter' in configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const mappedConfiguration = {
    ...configuration,
    filter: mapRecordFiltersOfFilter({
      filter: configuration.filter,
      mapRecordFilter,
    }),
  };

  return toResult({ original: configuration, mapped: mappedConfiguration });
};
