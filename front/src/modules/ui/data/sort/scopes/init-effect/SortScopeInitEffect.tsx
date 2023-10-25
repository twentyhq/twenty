import { useEffect } from 'react';

import { SortDefinition } from '@/ui/data/sort/types/SortDefinition';

import { useSortStates } from '../../hooks/useSortStates';

type SortScopeInitEffectProps = {
  sortScopeId: string;
  availableSorts?: SortDefinition[];
};

export const SortScopeInitEffect = ({
  sortScopeId,
  availableSorts,
}: SortScopeInitEffectProps) => {
  const { setAvailableSorts } = useSortStates(sortScopeId);

  useEffect(() => {
    if (availableSorts) {
      setAvailableSorts(availableSorts);
    }
  }, [availableSorts, setAvailableSorts]);

  return <></>;
};
