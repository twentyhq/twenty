import { useRecoilState } from 'recoil';

import { LightButton } from '@/ui/button/components/LightButton';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconPlus } from '@/ui/icon';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { FilterDropdownId } from '../constants/FilterDropdownId';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { activeViewBarFilterState } from '../states/activeViewBarFilterState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownId: FilterDropdownId,
  });
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    filterDefinitionUsedInDropdownScopedState,
    ViewBarRecoilScopeContext,
  );

  const [, setActiveViewBarFilter] = useRecoilState(activeViewBarFilterState);

  const handleClick = () => {
    // close any actively editing filter if any in view bar
    setFilterDefinitionUsedInDropdown(null);
    setActiveViewBarFilter('');
    toggleDropdown();
  };

  return (
    <LightButton
      onClick={handleClick}
      icon={<IconPlus />}
      title="Add filter"
      accent="tertiary"
    />
  );
};
