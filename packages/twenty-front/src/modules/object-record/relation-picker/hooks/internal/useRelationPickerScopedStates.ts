import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { getRelationPickerScopedStates } from '@/object-record/relation-picker/utils/getRelationPickerScopedStates';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const useRelationPickerScopedStates = (args?: {
  relationPickerScopedId?: string;
}) => {
  const { relationPickerScopedId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
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
