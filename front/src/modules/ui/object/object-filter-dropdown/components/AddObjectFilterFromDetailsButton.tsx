import { useRecoilState } from 'recoil';

import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';
import { useViewBarContext } from '../hooks/useViewBarContext';
import { activeViewBarFilterState } from '../states/activeViewBarFilterState';
import { filterDefinitionUsedInDropdownScopedState } from '../states/filterDefinitionUsedInDropdownScopedState';

export const AddObjectFilterFromDetailsButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectFilterDropdownId,
  });
  const { ViewBarRecoilScopeContext } = useViewBarContext();

  const [, setFilterDefinitionUsedInDropdown] = useRecoilScopedState(
    // FIXME: Bug here
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
