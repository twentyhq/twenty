import { useRecoilCallback } from 'recoil';
import { filterDefinitionUsedInDropdownComponentState } from '../states/filterDefinitionUsedInDropdownComponentState';
import { FilterDefinition } from '../types/FilterDefinition';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useSetFilterDefinitionUsedInDropdownInScope = () => {
  const setFilterDefinitionUsedInDropdownInScope = useRecoilCallback(
    ({ set }) =>
      (scopeId: string, filterDefinition: FilterDefinition | null) => {
        const filterDefinitionUsedInDropdownState = extractComponentState(
          filterDefinitionUsedInDropdownComponentState,
          scopeId,
        );
        set(filterDefinitionUsedInDropdownState, filterDefinition);
      },
    [],
  );

  return {
    setFilterDefinitionUsedInDropdownInScope,
  };
};
