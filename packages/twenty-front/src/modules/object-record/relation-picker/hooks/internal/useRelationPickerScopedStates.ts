import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { getRelationPickerScopedStates } from '@/object-record/relation-picker/utils/getRelationPickerScopedStates';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const useRelationPickerScopedStates = (args?: {
  relationPickerScopedId?: string;
}) => {
  const { relationPickerScopedId } = args ?? {};

  const scopeId = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
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
