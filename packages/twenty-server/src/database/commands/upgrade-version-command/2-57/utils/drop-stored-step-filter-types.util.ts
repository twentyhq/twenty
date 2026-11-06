import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { searchVariableInOutputSchema } from 'twenty-shared/workflow';

const STEP_TYPES_WITH_FILTERS = ['FILTER', 'IF_ELSE'];

// Runs fail on a filter whose field was deleted
export const DELETED_FIELD_TYPE = 'none, the field was deleted';

export type StepFilterTypeChange = {
  stepId: string;
  stepFilterId: unknown;
  storedType: unknown;
  computedType: string;
};

type VariableSource = { id: string; type: string; outputSchema: unknown };

type DroppedStepFilterTypes<TValue> = {
  value: TValue;
  hasChanged: boolean;
  typeChanges: StepFilterTypeChange[];
};

// As runs compute it from 2.57: the field's type, else the type the referenced output schema declares
const computeTypeAsOf257 = ({
  stepFilter,
  fieldTypeById,
  variableSources,
}: {
  stepFilter: Record<string, unknown>;
  fieldTypeById: Map<string, string>;
  variableSources: VariableSource[];
}): string | undefined => {
  if (typeof stepFilter.fieldMetadataId === 'string') {
    const fieldType = fieldTypeById.get(stepFilter.fieldMetadataId);

    if (!isDefined(fieldType)) {
      return DELETED_FIELD_TYPE;
    }

    return fieldType === 'MORPH_RELATION' ? 'RELATION' : fieldType;
  }

  if (typeof stepFilter.stepOutputKey !== 'string') {
    return 'unknown';
  }

  const variableSource = variableSources.find(({ id }) =>
    (stepFilter.stepOutputKey as string)
      .replace(/^\{\{/, '')
      .startsWith(`${id}.`),
  );

  if (!isDefined(variableSource)) {
    return undefined;
  }

  return (
    searchVariableInOutputSchema({
      schema: variableSource.outputSchema,
      stepType: variableSource.type,
      stepName: '',
      rawVariableName: stepFilter.stepOutputKey,
      isFullRecord: stepFilter.isFullRecord === true,
    }).variableType ?? 'unknown'
  );
};

const dropStepFilterTypes = ({
  stepId,
  stepFilters,
  fieldTypeById,
  variableSources,
}: {
  stepId: string;
  stepFilters: unknown;
  fieldTypeById: Map<string, string>;
  variableSources: VariableSource[];
}): DroppedStepFilterTypes<unknown> => {
  if (
    !Array.isArray(stepFilters) ||
    !stepFilters.some(
      (stepFilter) => isPlainObject(stepFilter) && 'type' in stepFilter,
    )
  ) {
    return { value: stepFilters, hasChanged: false, typeChanges: [] };
  }

  const typeChanges: StepFilterTypeChange[] = [];

  const value = stepFilters.map((stepFilter) => {
    if (!isPlainObject(stepFilter) || !('type' in stepFilter)) {
      return stepFilter;
    }

    const { type: storedType, ...storedStepFilter } = stepFilter;
    const computedType = computeTypeAsOf257({
      stepFilter,
      fieldTypeById,
      variableSources,
    });

    if (isDefined(computedType) && computedType !== storedType) {
      typeChanges.push({
        stepId,
        stepFilterId: stepFilter.id,
        storedType,
        computedType,
      });
    }

    return storedStepFilter;
  });

  return { value, hasChanged: true, typeChanges };
};

export const dropStoredStepFilterTypesFromSteps = ({
  steps,
  fieldTypeById,
}: {
  steps: unknown;
  fieldTypeById: Map<string, string>;
}): DroppedStepFilterTypes<unknown> => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false, typeChanges: [] };
  }

  const variableSources = steps.filter(isPlainObject).map((step) => ({
    id: String(step.id),
    type: String(step.type),
    outputSchema: isPlainObject(step.settings)
      ? step.settings.outputSchema
      : undefined,
  }));

  let hasChanged = false;
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

    const droppedStepFilterTypes = dropStepFilterTypes({
      stepId: String(step.id),
      stepFilters: step.settings.input.stepFilters,
      fieldTypeById,
      variableSources,
    });

    if (!droppedStepFilterTypes.hasChanged) {
      return step;
    }

    hasChanged = true;
    typeChanges.push(...droppedStepFilterTypes.typeChanges);

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          stepFilters: droppedStepFilterTypes.value,
        },
      },
    };
  });

  return { value: hasChanged ? value : steps, hasChanged, typeChanges };
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
    return { value: trigger, hasChanged: false, typeChanges: [] };
  }

  const droppedStepFilterTypes = dropStepFilterTypes({
    stepId: 'trigger',
    stepFilters: trigger.settings.filter.stepFilters,
    fieldTypeById,
    variableSources: [
      {
        id: 'trigger',
        type: 'DATABASE_EVENT',
        outputSchema: trigger.settings.outputSchema,
      },
    ],
  });

  if (!droppedStepFilterTypes.hasChanged) {
    return { value: trigger, hasChanged: false, typeChanges: [] };
  }

  return {
    value: {
      ...trigger,
      settings: {
        ...trigger.settings,
        filter: {
          ...trigger.settings.filter,
          stepFilters: droppedStepFilterTypes.value,
        },
      },
    },
    hasChanged: true,
    typeChanges: droppedStepFilterTypes.typeChanges,
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
    return { value: triggers, hasChanged: false, typeChanges: [] };
  }

  const droppedPerTrigger = triggers.map((trigger) =>
    dropStoredStepFilterTypesFromTrigger({ trigger, fieldTypeById }),
  );

  const hasChanged = droppedPerTrigger.some(({ hasChanged }) => hasChanged);

  return {
    value: hasChanged ? droppedPerTrigger.map(({ value }) => value) : triggers,
    hasChanged,
    typeChanges: droppedPerTrigger.flatMap(({ typeChanges }) => typeChanges),
  };
};
