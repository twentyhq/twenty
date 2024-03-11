import { RecordFieldInputScopeInternalContext } from '@/object-record/record-field/scopes/scope-internal-context/RecordFieldInputScopeInternalContext';
import { recordFieldInputDraftValueComponentSelector } from '@/object-record/record-field/states/selectors/recordFieldInputDraftValueComponentSelector';
import { FieldInputDraftValue } from '@/object-record/record-field/types/FieldInputDraftValue';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentSelector } from '@/ui/utilities/state/component-state/utils/extractComponentSelector';

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
