import { RecordFieldInputScopeInternalContext } from '@/object-record/record-field/scopes/scope-internal-context/RecordFieldInputScopeInternalContext';
import { recordFieldInputDraftValueStateScopeMap } from '@/object-record/record-field/states/recordFieldInputDraftValueStateScopeMap';
import { recordFieldInputDraftValueSelectorScopeMap } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueSelectorScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { getSelector } from '@/ui/utilities/recoil-scope/utils/getSelector';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordFieldInputStates = <T>(recordFieldInputId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordFieldInputScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordFieldInputId),
  );

  return {
    scopeId,
    getDraftValueState: getState(
      recordFieldInputDraftValueStateScopeMap,
      scopeId,
    ),
    getDraftValueSelector: getSelector<T>(
      recordFieldInputDraftValueSelectorScopeMap,
      scopeId,
    ),
  };
};
