import {
  extractComponentSelector,
  getScopeIdOrUndefinedFromComponentId,
  useAvailableScopeIdOrThrow,
} from 'twenty-ui';

import { RecordFieldInputScopeInternalContext } from '@/object-record/record-field/scopes/scope-internal-context/RecordFieldInputScopeInternalContext';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';

export const useRecordFieldInputStates = <FieldValue>(
  recordFieldInputId?: string,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordFieldInputScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordFieldInputId),
  );

  return {
    scopeId,
    getDraftValueSelector: extractComponentSelector<
      FieldInputDraftValue<FieldValue> | undefined
    >(recordFieldInputDraftValueComponentSelector, scopeId),
  };
};
