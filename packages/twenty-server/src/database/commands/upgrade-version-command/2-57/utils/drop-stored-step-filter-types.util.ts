import { isDefined, isPlainObject } from 'twenty-shared/utils';

const STEP_TYPES_WITH_FILTERS = ['FILTER', 'IF_ELSE'];

export const DELETED_FIELD_TYPE = 'none, the field was deleted';

export type StepFilterTypeChange = {
  stepId: string;
  stepFilterId: unknown;
  storedType: unknown;
  computedType: string;
};

export type DroppedStepFilterTypes<TValue> = {
  value: TValue;
  hasChanged: boolean;
  typeChanges: StepFilterTypeChange[];
  variableFilterCount: number;
};

const UNCHANGED = {
  hasChanged: false,
  typeChanges: [],
  variableFilterCount: 0,
};

// Only a field filter's type is known here: a variable's comes from output schemas the run computes
const computeFieldFilterTypeAsOf257 = (
  fieldMetadataId: string,
  fieldTypeById: Map<string, string>,
): string => {
  const fieldType = fieldTypeById.get(fieldMetadataId);

  if (!isDefined(fieldType)) {
    return DELETED_FIELD_TYPE;
  }

  return fieldType === 'MORPH_RELATION' ? 'RELATION' : fieldType;
};

const dropStepFilterTypes = ({
  stepId,
  stepFilters,
  fieldTypeById,
}: {
  stepId: string;
  stepFilters: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (
    !Array.isArray(stepFilters) ||
    !stepFilters.some(
      (stepFilter) => isPlainObject(stepFilter) && 'type' in stepFilter,
    )
  ) {
    return { value: stepFilters, ...UNCHANGED };
  }

  const typeChanges: StepFilterTypeChange[] = [];
  let variableFilterCount = 0;

  const value = stepFilters.map((stepFilter) => {
    if (!isPlainObject(stepFilter) || !('type' in stepFilter)) {
      return stepFilter;
    }

    const { type: storedType, ...storedStepFilter } = stepFilter;
    const { fieldMetadataId } = stepFilter;

    if (typeof fieldMetadataId !== 'string') {
      variableFilterCount += 1;

      return storedStepFilter;
    }

    const computedType = computeFieldFilterTypeAsOf257(
      fieldMetadataId,
      fieldTypeById,
    );

    if (computedType !== storedType) {
      typeChanges.push({
        stepId,
        stepFilterId: stepFilter.id,
        storedType,
        computedType,
      });
    }

    return storedStepFilter;
  });

  return { value, hasChanged: true, typeChanges, variableFilterCount };
};

export const dropStoredStepFilterTypesFromSteps = ({
  steps,
  fieldTypeById,
}: {
  steps: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (!Array.isArray(steps)) {
    return { value: steps, ...UNCHANGED };
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

    const dropped = dropStepFilterTypes({
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
    return { value: trigger, ...UNCHANGED };
  }

  const dropped = dropStepFilterTypes({
    stepId: 'trigger',
    stepFilters: trigger.settings.filter.stepFilters,
    fieldTypeById,
  });

  if (!dropped.hasChanged) {
    return { value: trigger, ...UNCHANGED };
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

export const dropStoredStepFilterTypesFromTriggers = ({
  triggers,
  fieldTypeById,
}: {
  triggers: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (!Array.isArray(triggers)) {
    return { value: triggers, ...UNCHANGED };
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
