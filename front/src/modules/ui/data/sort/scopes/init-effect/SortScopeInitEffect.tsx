import { useEffect } from 'react';

import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';

import { useSortStates } from '../../hooks/useSortStates';

type SortScopeInitEffectProps = {
  sortScopeId: string;
  availableSortDefinitions?: SortDefinition[];
};

export const SortScopeInitEffect = ({
  sortScopeId,
  availableSortDefinitions,
}: SortScopeInitEffectProps) => {
  const { setAvailableSortDefinitions } = useSortStates(sortScopeId);

  useEffect(() => {
    if (availableSortDefinitions) {
      setAvailableSortDefinitions(availableSortDefinitions);
    }
  }, [availableSortDefinitions, setAvailableSortDefinitions]);

  return <></>;
};
