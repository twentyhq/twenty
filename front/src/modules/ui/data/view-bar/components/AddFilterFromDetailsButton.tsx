import { useRecoilState } from 'recoil';

import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { FilterDropdownId } from '../constants/FilterDropdownId';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { activeViewBarFilterState } from '../states/activeViewBarFilterState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownScopeId: FilterDropdownId,
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
