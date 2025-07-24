import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useLingui } from '@lingui/react/macro';
import { IconFilter } from 'twenty-ui/display';

export const AnyFieldSearchChip = () => {
  const { t } = useLingui();

  const { closeDropdown } = useCloseDropdown();

  const [anyFieldFilterValue, setAnyFieldFilterValue] =
    useRecoilComponentStateV2(anyFieldFilterValueComponentState);

  const handleRemoveClick = () => {
    closeDropdown();
    setAnyFieldFilterValue('');
  };

  return (
    <SortOrFilterChip
      testId={ADVANCED_FILTER_DROPDOWN_ID}
      labelKey={t`Any field :`}
      labelValue={anyFieldFilterValue}
      Icon={IconFilter}
      onRemove={handleRemoveClick}
      type="filter"
    />
  );
};
