import { useRecoilState } from 'recoil';

import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { activeViewBarFilterState } from '@/views/states/activeViewBarFilterState';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';
import { useFilter } from '../hooks/useFilter';

export const AddObjectFilterFromDetailsButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectFilterDropdownId,
  });

  const { setFilterDefinitionUsedInDropdown } = useFilter();

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
