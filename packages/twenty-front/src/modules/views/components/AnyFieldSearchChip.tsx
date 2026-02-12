import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/display';

export const AnyFieldSearchChip = () => {
  const { t } = useLingui();

  const { closeDropdown } = useCloseDropdown();

  const [anyFieldFilterValue, setAnyFieldFilterValue] = useRecoilComponentState(
    anyFieldFilterValueComponentState,
  );

  const handleRemoveClick = () => {
    closeDropdown();
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
    />
  );
};
