import { useEffect } from 'react';

import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';

import { useObjectSortDropdownStates } from '../../hooks/useObjectSortDropdownStates';

type ObjectSortDropdownScopeInitEffectProps = {
  sortScopeId: string;
  availableSortDefinitions?: SortDefinition[];
};

export const ObjectSortDropdownScopeInitEffect = ({
  sortScopeId,
  availableSortDefinitions,
}: ObjectSortDropdownScopeInitEffectProps) => {
  const { setAvailableSortDefinitions } =
    useObjectSortDropdownStates(sortScopeId);

  useEffect(() => {
    if (availableSortDefinitions) {
      setAvailableSortDefinitions(availableSortDefinitions);
    }
  }, [availableSortDefinitions, setAvailableSortDefinitions]);

  return <></>;
};
