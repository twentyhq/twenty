import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { REPLACEMENT_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-56/constants/replacement-currency-code.constant';
import { WITHDRAWN_CURRENCY_CODE } from 'src/database/commands/upgrade-version-command/2-56/constants/withdrawn-currency-code.constant';
import { type MappedValue } from 'src/database/commands/upgrade-version-command/2-56/types/mapped-value.type';
import { replaceWithdrawnCurrencyCodeInRecordFilters } from 'src/database/commands/upgrade-version-command/2-56/utils/replace-withdrawn-currency-code-in-record-filters.util';
import { replaceWithdrawnCurrencyCodeInStepFilters } from 'src/database/commands/upgrade-version-command/2-56/utils/replace-withdrawn-currency-code-in-step-filters.util';
import { toMappedValue } from 'src/database/commands/upgrade-version-command/2-56/utils/to-mapped-value.util';

const replaceWithdrawnCurrencyCodeInObjectRecord = ({
  objectRecord,
  currencyFieldNames,
}: {
  objectRecord: Record<string, unknown>;
  currencyFieldNames: Set<string> | undefined;
}): Record<string, unknown> => {
  if (!isDefined(currencyFieldNames)) {
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
  stepType: string;
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
      if (!isString(input.objectName) || !isPlainObject(input.objectRecord)) {
        return input;
      }

      return {
        ...input,
        objectRecord: replaceWithdrawnCurrencyCodeInObjectRecord({
          objectRecord: input.objectRecord,
          currencyFieldNames: currencyFieldNamesByObjectNameSingular.get(
            input.objectName,
          ),
        }),
      };
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

  const mappedSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      !isString(step.type) ||
      !isPlainObject(step.settings) ||
      !isPlainObject(step.settings.input)
    ) {
      return step;
    }

    return {
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
    };
  });

  return toMappedValue({ original: steps, mapped: mappedSteps });
};
