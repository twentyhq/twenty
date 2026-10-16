import { isPlainObject } from 'twenty-shared/utils';

type StoredRecordFilter = Record<string, unknown>;

type MapStoredRecordFilter = (args: {
  recordFilter: StoredRecordFilter;
  index: number;
}) => StoredRecordFilter;

const mapRecordFiltersOfFilter = (
  filter: unknown,
  mapRecordFilter: MapStoredRecordFilter,
): unknown => {
  if (!isPlainObject(filter) || !Array.isArray(filter.recordFilters)) {
    return filter;
  }

  return {
    ...filter,
    recordFilters: filter.recordFilters.map((recordFilter, index) =>
      isPlainObject(recordFilter)
        ? mapRecordFilter({ recordFilter, index })
        : recordFilter,
    ),
  };
};

const toResult = (original: unknown, mapped: unknown) => {
  const hasChanged = JSON.stringify(original) !== JSON.stringify(mapped);

  return { value: hasChanged ? mapped : original, hasChanged };
};

export const mapFindRecordsStepRecordFilters = (
  steps: unknown,
  mapRecordFilter: (args: {
    recordFilter: StoredRecordFilter;
    index: number;
    stepId: string;
  }) => StoredRecordFilter,
): { value: unknown; hasChanged: boolean } => {
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

    const stepId = String(step.id);

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          filter: mapRecordFiltersOfFilter(
            step.settings.input.filter,
            ({ recordFilter, index }) =>
              mapRecordFilter({ recordFilter, index, stepId }),
          ),
        },
      },
    };
  });

  return toResult(steps, mappedSteps);
};

export const mapChartWidgetRecordFilters = (
  configuration: unknown,
  mapRecordFilter: MapStoredRecordFilter,
): { value: unknown; hasChanged: boolean } => {
  if (!isPlainObject(configuration) || !('filter' in configuration)) {
    return { value: configuration, hasChanged: false };
  }

  const mappedConfiguration = {
    ...configuration,
    filter: mapRecordFiltersOfFilter(configuration.filter, mapRecordFilter),
  };

  return toResult(configuration, mappedConfiguration);
};
