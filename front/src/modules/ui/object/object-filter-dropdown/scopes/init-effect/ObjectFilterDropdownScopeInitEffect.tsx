import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

import { useFilterStates } from '../../hooks/useFilterStates';

type ObjectFilterDropdownScopeInitEffectProps = {
  filterScopeId: string;
  viewId: string;
};

export const ObjectFilterDropdownScopeInitEffect = ({
  filterScopeId,
  viewId,
}: ObjectFilterDropdownScopeInitEffectProps) => {
  const { availableFilterDefinitionsState } = useViewScopedStates({
    customViewScopeId: viewId,
  });

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const { setAvailableFilterDefinitions } = useFilterStates(filterScopeId);

  useEffect(() => {
    if (availableFilterDefinitions) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }
  }, [availableFilterDefinitions, setAvailableFilterDefinitions]);

  return <></>;
};
