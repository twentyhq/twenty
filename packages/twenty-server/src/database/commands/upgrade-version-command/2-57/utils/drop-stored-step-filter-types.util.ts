import { isDefined, isPlainObject } from 'twenty-shared/utils';

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

export const UNCHANGED_STEP_FILTER_TYPES = {
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

export const dropStoredStepFilterTypes = ({
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
    return { value: stepFilters, ...UNCHANGED_STEP_FILTER_TYPES };
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
