import { getRelationPickerScopedStates } from '@/ui/input/components/internal/relation-picker/utils/getRelationPickerScopedStates';
import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const useRelationPickerScopedStates = (args?: {
  relationPickerScopedId?: string;
}) => {
  const { relationPickerScopedId } = args ?? {};

  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    relationPickerScopedId,
  );

  const { identifiersMapperState } = getRelationPickerScopedStates({
    relationPickerScopeId: scopeId,
  });

  const { searchQueryState } = getRelationPickerScopedStates({
    relationPickerScopeId: scopeId,
  });

  return {
    scopeId,
    identifiersMapperState,
    searchQueryState,
  };
};
