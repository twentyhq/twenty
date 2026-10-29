import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-53/constants/withdrawn-currency-code.constant';
import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-53/types/mapped-value.type';
import { replaceWithdrawnCurrencyCodeInFilterValue } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-filter-value.util';
import { replaceWithdrawnCurrencyCodeInRecordFilters } from 'src/database/commands/upgrade-version-command/2-53/utils/replace-withdrawn-currency-code-in-record-filters.util';
import { toMappedValue } from 'src/database/commands/upgrade-version-command/2-53/utils/to-mapped-value.util';

const replaceWithdrawnCurrencyCodeInStepFilters = ({
  stepFilters,
  currencyFieldMetadataIds,
}: {
  stepFilters: unknown;
  currencyFieldMetadataIds: Set<string>;
}): unknown => {
  if (!Array.isArray(stepFilters)) {
    return stepFilters;
  }

  return stepFilters.map((stepFilter) => {
    if (
      !isPlainObject(stepFilter) ||
      !isString(stepFilter.fieldMetadataId) ||
      !currencyFieldMetadataIds.has(stepFilter.fieldMetadataId) ||
      stepFilter.compositeFieldSubFieldName !== 'currencyCode'
    ) {
      return stepFilter;
    }

    const { value, hasChanged } = replaceWithdrawnCurrencyCodeInFilterValue(
      stepFilter.value,
    );

    return hasChanged ? { ...stepFilter, value } : stepFilter;
  });
};

const replaceWithdrawnCurrencyCodeInObjectRecord = ({
  objectRecord,
  currencyFieldNames,
}: {
  objectRecord: unknown;
  currencyFieldNames: Set<string> | undefined;
}): unknown => {
  if (!isPlainObject(objectRecord) || !isDefined(currencyFieldNames)) {
    return objectRecord;
  }

  return Object.fromEntries(
    Object.entries(objectRecord).map(([fieldName, fieldValue]) =>
      currencyFieldNames.has(fieldName) &&
      isPlainObject(fieldValue) &&
      fieldValue.currencyCode === WITHDRAWN_CURRENCY_CODE
        ? [
            fieldName,
            { ...fieldValue, currencyCode: REPLACEMENT_CURRENCY_CODE },
          ]
        : [fieldName, fieldValue],
    ),
  );
};

const replaceWithdrawnCurrencyCodeInStepInput = ({
  stepType,
  input,
  currencyFieldMetadataIds,
  currencyFieldNamesByObjectNameSingular,
}: {
  stepType: unknown;
  input: Record<string, unknown>;
  currencyFieldMetadataIds: Set<string>;
  currencyFieldNamesByObjectNameSingular: Map<string, Set<string>>;
}): Record<string, unknown> => {
  switch (stepType) {
    case WorkflowActionType.FIND_RECORDS:
      return {
        ...input,
        filter: replaceWithdrawnCurrencyCodeInRecordFilters({
          filter: input.filter,
          currencyFieldMetadataIds,
        }),
      };
    case WorkflowActionType.FILTER:
    case WorkflowActionType.IF_ELSE:
      return {
        ...input,
        stepFilters: replaceWithdrawnCurrencyCodeInStepFilters({
          stepFilters: input.stepFilters,
          currencyFieldMetadataIds,
        }),
      };
    case WorkflowActionType.CREATE_RECORD:
    case WorkflowActionType.UPDATE_RECORD:
    case WorkflowActionType.UPSERT_RECORD:
      return isString(input.objectName)
        ? {
            ...input,
            objectRecord: replaceWithdrawnCurrencyCodeInObjectRecord({
              objectRecord: input.objectRecord,
              currencyFieldNames: currencyFieldNamesByObjectNameSingular.get(
                input.objectName,
              ),
            }),
          }
        : input;
    default:
      return input;
  }
};

export const replaceWithdrawnCurrencyCodeInWorkflowSteps = ({
  steps,
  currencyFieldMetadataIds,
  currencyFieldNamesByObjectNameSingular,
}: {
  steps: unknown;
  currencyFieldMetadataIds: Set<string>;
  currencyFieldNamesByObjectNameSingular: Map<string, Set<string>>;
}): MappedValue => {
  if (!Array.isArray(steps)) {
    return { value: steps, hasChanged: false };
  }

  const mappedSteps = steps.map((step) =>
    isPlainObject(step) &&
    isPlainObject(step.settings) &&
    isPlainObject(step.settings.input)
      ? {
          ...step,
          settings: {
            ...step.settings,
            input: replaceWithdrawnCurrencyCodeInStepInput({
              stepType: step.type,
              input: step.settings.input,
              currencyFieldMetadataIds,
              currencyFieldNamesByObjectNameSingular,
            }),
          },
        }
      : step,
  );

  return toMappedValue({ original: steps, mapped: mappedSteps });
};
