import { useRecoilCallback } from 'recoil';
import { filterDefinitionUsedInDropdownComponentState } from '../states/filterDefinitionUsedInDropdownComponentState';
import { FilterDefinition } from '../types/FilterDefinition';

export const useSetFilterDefinitionUsedInDropdownInScope = () => {
  const setFilterDefinitionUsedInDropdownInScope = useRecoilCallback(
    ({ set }) =>
      (
        componentInstanceId: string,
        filterDefinition: FilterDefinition | null,
      ) => {
        const filterDefinitionUsedInDropdownState =
          filterDefinitionUsedInDropdownComponentState.atomFamily({
            instanceId: componentInstanceId,
          });

        set(filterDefinitionUsedInDropdownState, filterDefinition);
      },
    [],
  );

  return {
    setFilterDefinitionUsedInDropdownInScope,
  };
};
