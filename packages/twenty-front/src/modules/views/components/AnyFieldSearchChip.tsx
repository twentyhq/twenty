import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { type DropdownProps } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ANY_FIELD_SEARCH_DROPDOWN_ID } from '@/views/constants/AnyFieldSearchDropdownId';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/icon';

type AnyFieldSearchChipProps = {
  dropdown?: Omit<DropdownProps, 'clickableComponent'>;
};

export const AnyFieldSearchChip = ({ dropdown }: AnyFieldSearchChipProps) => {
  const { t } = useLingui();

  const { closeDropdown } = useCloseDropdown();

  const [anyFieldFilterValue, setAnyFieldFilterValue] = useAtomComponentState(
    anyFieldFilterValueComponentState,
  );

  const handleRemoveClick = () => {
    closeDropdown(ANY_FIELD_SEARCH_DROPDOWN_ID);
    setAnyFieldFilterValue('');
  };

  return (
    <SortOrFilterChip
      testId={ViewBarFilterDropdownIds.ADVANCED}
      labelKey={t`Any field`}
      labelValue={`: ${anyFieldFilterValue}`}
      Icon={IconFilter}
      onRemove={handleRemoveClick}
      type="filter"
      dropdown={dropdown}
    />
  );
};
