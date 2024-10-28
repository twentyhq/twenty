import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { getRelationPickerScopedStates } from '@/object-record/relation-picker/utils/getRelationPickerScopedStates';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useRelationPickerScopedStates = (args?: {
  relationPickerScopedId?: string;
}) => {
  const { relationPickerScopedId } = args ?? {};

  const scopeId = useAvailableComponentInstanceIdOrThrow(
    RecordTableScopeInternalContext,
    relationPickerScopedId,
  );

  const {
    relationPickerSearchFilterState,
    relationPickerPreselectedIdState,
    searchQueryState,
  } = getRelationPickerScopedStates({
    relationPickerScopeId: scopeId,
  });

  return {
    scopeId,
    relationPickerSearchFilterState,
    relationPickerPreselectedIdState,
    searchQueryState,
  };
};
