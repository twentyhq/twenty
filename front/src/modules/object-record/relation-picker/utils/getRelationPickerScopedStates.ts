import { identifiersMapperScopedState } from '@/object-record/relation-picker/states/identifiersMapperScopedState';
import { relationPickerPreselectedIdScopedState } from '@/object-record/relation-picker/states/relationPickerPreselectedIdScopedState';
import { relationPickerSearchFilterScopedState } from '@/object-record/relation-picker/states/relationPickerSearchFilterScopedState';
import { searchQueryScopedState } from '@/object-record/relation-picker/states/searchQueryScopedState';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';

export const getRelationPickerScopedStates = ({
  relationPickerScopeId,
}: {
  relationPickerScopeId: string;
}) => {
  const identifiersMapperState = getScopedState(
    identifiersMapperScopedState,
    relationPickerScopeId,
  );

  const searchQueryState = getScopedState(
    searchQueryScopedState,
    relationPickerScopeId,
  );

  const relationPickerPreselectedIdState = getScopedState(
    relationPickerPreselectedIdScopedState,
    relationPickerScopeId,
  );

  const relationPickerSearchFilterState = getScopedState(
    relationPickerSearchFilterScopedState,
    relationPickerScopeId,
  );

  return {
    identifiersMapperState,
    relationPickerSearchFilterState,
    relationPickerPreselectedIdState,
    searchQueryState,
  };
};
