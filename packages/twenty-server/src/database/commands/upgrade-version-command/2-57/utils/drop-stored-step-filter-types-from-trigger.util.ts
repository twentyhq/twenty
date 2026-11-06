import { isPlainObject } from 'twenty-shared/utils';

import {
  dropStoredStepFilterTypes,
  type DroppedStepFilterTypes,
  UNCHANGED_STEP_FILTER_TYPES,
} from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';

export const dropStoredStepFilterTypesFromTrigger = ({
  trigger,
  fieldTypeById,
}: {
  trigger: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (
    !isPlainObject(trigger) ||
    trigger.type !== 'DATABASE_EVENT' ||
    !isPlainObject(trigger.settings) ||
    !isPlainObject(trigger.settings.filter)
  ) {
    return { value: trigger, ...UNCHANGED_STEP_FILTER_TYPES };
  }

  const dropped = dropStoredStepFilterTypes({
    stepId: 'trigger',
    stepFilters: trigger.settings.filter.stepFilters,
    fieldTypeById,
  });

  if (!dropped.hasChanged) {
    return { value: trigger, ...UNCHANGED_STEP_FILTER_TYPES };
  }

  return {
    ...dropped,
    value: {
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: { ...trigger.settings.filter, stepFilters: dropped.value },
      },
    },
  };
};
