import { identifiersMapperScopedState } from '@/ui/input/components/internal/relation-picker/states/identifiersMapperScopedState';
import { searchQueryScopedState } from '@/ui/input/components/internal/relation-picker/states/searchQueryScopedState';
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
