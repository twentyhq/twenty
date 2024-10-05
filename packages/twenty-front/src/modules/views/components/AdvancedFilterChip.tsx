import { IconFilterCog } from 'twenty-ui';

import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';

type AdvancedFilterChipProps = {
  onRemove: () => void;
};

export const AdvancedFilterChip = ({ onRemove }: AdvancedFilterChipProps) => (
  <SortOrFilterChip
    testId={ADVANCED_FILTER_DROPDOWN_ID}
    labelKey="Advanced filter"
    labelValue=""
    Icon={IconFilterCog}
    onRemove={onRemove}
  />
);
