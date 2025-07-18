import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { viewAnyFieldSearchValueComponentState } from '@/views/states/viewAnyFieldSearchValueComponentState';
import { IconFilter } from 'twenty-ui/display';

export const AnyFieldSearchChip = () => {
  const { closeDropdown } = useCloseDropdown();

  const [viewAnyFieldSearchValue, setViewAnyFieldSearchValue] =
    useRecoilComponentStateV2(viewAnyFieldSearchValueComponentState);

  const handleRemoveClick = () => {
    closeDropdown();
    setViewAnyFieldSearchValue('');
  };

  return (
    <SortOrFilterChip
      testId={ADVANCED_FILTER_DROPDOWN_ID}
      labelKey={'Any field :'}
      labelValue={viewAnyFieldSearchValue}
      Icon={IconFilter}
      onRemove={handleRemoveClick}
      type="filter"
    />
  );
};
