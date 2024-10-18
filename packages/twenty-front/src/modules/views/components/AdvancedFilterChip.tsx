import { IconFilterCog } from 'twenty-ui';

import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { plural } from 'pluralize';

type AdvancedFilterChipProps = {
  onRemove: () => void;
  advancedFilterCount?: number;
};

export const AdvancedFilterChip = ({
  onRemove,
  advancedFilterCount,
}: AdvancedFilterChipProps) => {
  const labelText = 'advanced rule';
  const chipLabel = `${advancedFilterCount ?? 0} ${advancedFilterCount === 1 ? labelText : plural(labelText)}`;
  return (
    <SortOrFilterChip
      testId={ADVANCED_FILTER_DROPDOWN_ID}
      labelKey={chipLabel}
      labelValue=""
      Icon={IconFilterCog}
      onRemove={onRemove}
    />
  );
};
