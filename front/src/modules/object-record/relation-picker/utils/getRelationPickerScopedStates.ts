import { identifiersMapperScopedState } from '@/object-record/relation-picker/states/identifiersMapperScopedState';
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

  return {
    identifiersMapperState,
    searchQueryState,
  };
};
