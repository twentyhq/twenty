import { isPlainObject } from 'twenty-shared/utils';

import {
  dropStoredStepFilterTypes,
  type DroppedStepFilterTypes,
  type StepFilterTypeChange,
  UNCHANGED_STEP_FILTER_TYPES,
} from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';

const STEP_TYPES_WITH_FILTERS = ['FILTER', 'IF_ELSE'];

export const dropStoredStepFilterTypesFromSteps = ({
  steps,
  fieldTypeById,
}: {
  steps: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (!Array.isArray(steps)) {
    return { value: steps, ...UNCHANGED_STEP_FILTER_TYPES };
  }

  let hasChanged = false;
  let variableFilterCount = 0;
  const typeChanges: StepFilterTypeChange[] = [];

  const value = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      !STEP_TYPES_WITH_FILTERS.includes(String(step.type)) ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    const dropped = dropStoredStepFilterTypes({
      stepId: String(step.id),
      stepFilters: step.settings.input.stepFilters,
      fieldTypeById,
    });

    if (!dropped.hasChanged) {
      return step;
    }

    hasChanged = true;
    typeChanges.push(...dropped.typeChanges);
    variableFilterCount += dropped.variableFilterCount;

    return {
      ...step,
      settings: {
        ...step.settings,
        input: { ...step.settings.input, stepFilters: dropped.value },
      },
    };
  });

  return {
    value: hasChanged ? value : steps,
    hasChanged,
    typeChanges,
    variableFilterCount,
  };
};
