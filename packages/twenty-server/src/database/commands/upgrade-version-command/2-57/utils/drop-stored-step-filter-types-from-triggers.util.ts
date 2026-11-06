import {
  type DroppedStepFilterTypes,
  UNCHANGED_STEP_FILTER_TYPES,
} from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types.util';
import { dropStoredStepFilterTypesFromTrigger } from 'src/database/commands/upgrade-version-command/2-57/utils/drop-stored-step-filter-types-from-trigger.util';

export const dropStoredStepFilterTypesFromTriggers = ({
  triggers,
  fieldTypeById,
}: {
  triggers: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (!Array.isArray(triggers)) {
    return { value: triggers, ...UNCHANGED_STEP_FILTER_TYPES };
  }

  const droppedPerTrigger = triggers.map((trigger) =>
    dropStoredStepFilterTypesFromTrigger({ trigger, fieldTypeById }),
  );

  const hasChanged = droppedPerTrigger.some(({ hasChanged }) => hasChanged);

  return {
    value: hasChanged ? droppedPerTrigger.map(({ value }) => value) : triggers,
    hasChanged,
    typeChanges: droppedPerTrigger.flatMap(({ typeChanges }) => typeChanges),
    variableFilterCount: droppedPerTrigger.reduce(
      (count, dropped) => count + dropped.variableFilterCount,
      0,
    ),
  };
};
