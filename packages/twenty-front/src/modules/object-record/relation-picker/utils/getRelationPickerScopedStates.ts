import { getScopedStateDeprecated } from 'twenty-ui';

import { relationPickerPreselectedIdScopedState } from '@/object-record/relation-picker/states/relationPickerPreselectedIdScopedState';
import { relationPickerSearchFilterScopedState } from '@/object-record/relation-picker/states/relationPickerSearchFilterScopedState';
import { searchQueryScopedState } from '@/object-record/relation-picker/states/searchQueryScopedState';

export const getRelationPickerScopedStates = ({
  relationPickerScopeId,
}: {
  relationPickerScopeId: string;
}) => {
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
    relationPickerSearchFilterState,
    relationPickerPreselectedIdState,
    searchQueryState,
  };
};
