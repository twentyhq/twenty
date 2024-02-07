import { RecordFieldInputScopeInternalContext } from '@/object-record/record-field/scopes/scope-internal-context/RecordFieldInputScopeInternalContext';
import { recordFieldInputDraftValueSelectorScopeMap } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueSelectorScopeMap';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { getSelector } from '@/ui/utilities/recoil-scope/utils/getSelector';

export const useRecordFieldInputStates = <FieldValue>(
  recordFieldInputId?: string,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordFieldInputScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordFieldInputId),
  );

  return {
    scopeId,
    getDraftValueSelector: getSelector<
      FieldInputDraftValue<FieldValue> | undefined
    >(recordFieldInputDraftValueSelectorScopeMap, scopeId),
  };
};
