import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useFilterDropdown } from '@/ui/object/object-filter-dropdown/hooks/useFilterDropdown';
import { Filter } from '@/ui/object/object-filter-dropdown/types/Filter';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

type ViewBarFilterEffectProps = {
  filterDropdownId: string;
  onFilterSelect?: ((filter: Filter) => void) | undefined;
};

export const ViewBarFilterEffect = ({
  filterDropdownId,
  onFilterSelect,
}: ViewBarFilterEffectProps) => {
  const { availableFilterDefinitionsState } = useViewScopedStates();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const { setAvailableFilterDefinitions, setOnFilterSelect } =
    useFilterDropdown({ filterDropdownId: filterDropdownId });

  useEffect(() => {
    if (availableFilterDefinitions) {
      setAvailableFilterDefinitions(availableFilterDefinitions);
    }

    if (onFilterSelect) {
      setOnFilterSelect(() => onFilterSelect);
    }
  }, [
    availableFilterDefinitions,
    onFilterSelect,
    setAvailableFilterDefinitions,
    setOnFilterSelect,
  ]);

  return <></>;
};
