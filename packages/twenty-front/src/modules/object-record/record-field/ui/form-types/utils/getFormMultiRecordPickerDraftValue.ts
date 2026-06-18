import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/types/RecordPickerValue';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';

export type FormMultiRecordPickerDraftValue =
  | {
      type: 'static';
      value: Array<RecordId | Variable>;
    }
  | {
      type: 'variable';
      value: Variable;
    };

const keepRecordIdsAndVariables = (
  entries: unknown[],
): Array<RecordId | Variable> =>
  entries.filter(
    (entry): entry is string =>
      isString(entry) &&
      (isValidUuid(entry) || isStandaloneVariableString(entry)),
  );

export const getFormMultiRecordPickerDraftValue = (
  defaultValue:
    | Array<RecordId | Variable>
    | Variable
    | string
    | null
    | undefined,
): FormMultiRecordPickerDraftValue => {
  if (isArray(defaultValue)) {
    return {
      type: 'static',
      value: keepRecordIdsAndVariables(defaultValue),
    };
  }

  if (isNonEmptyString(defaultValue)) {
    if (isStandaloneVariableString(defaultValue)) {
      return { type: 'variable', value: defaultValue };
    }

    if (isValidUuid(defaultValue)) {
      return { type: 'static', value: [defaultValue] };
    }

    try {
      const parsedValue = JSON.parse(defaultValue);

      if (isArray(parsedValue)) {
        return {
          type: 'static',
          value: keepRecordIdsAndVariables(parsedValue),
        };
      }
    } catch {}
  }

  return { type: 'static', value: [] };
};
