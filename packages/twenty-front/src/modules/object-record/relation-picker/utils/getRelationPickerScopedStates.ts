import { identifiersMapperScopedState } from '@/object-record/relation-picker/states/identifiersMapperScopedState';
import { relationPickerPreselectedIdScopedState } from '@/object-record/relation-picker/states/relationPickerPreselectedIdScopedState';
import { relationPickerSearchFilterScopedState } from '@/object-record/relation-picker/states/relationPickerSearchFilterScopedState';
import { searchQueryScopedState } from '@/object-record/relation-picker/states/searchQueryScopedState';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';

export const getRelationPickerScopedStates = ({
  relationPickerScopeId,
}: {
  relationPickerScopeId: string;
}) => {
  const identifiersMapperState = getScopedStateDeprecated(
    identifiersMapperScopedState,
    relationPickerScopeId,
  );

  const searchQueryState = getScopedStateDeprecated(
    searchQueryScopedState,
    relationPickerScopeId,
  );

  const relationPickerPreselectedIdState = getScopedStateDeprecated(
    relationPickerPreselectedIdScopedState,
    relationPickerScopeId,
  );

  const relationPickerSearchFilterState = getScopedStateDeprecated(
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
