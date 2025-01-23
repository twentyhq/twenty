import { AvatarChip, IconComponent } from 'twenty-ui';

import { RecordFilter } from '../../record-filter/types/RecordFilter';

type GenericEntityFilterChipProps = {
  filter: RecordFilter;
  Icon?: IconComponent;
};

export const GenericEntityFilterChip = ({
  filter,
  Icon,
}: GenericEntityFilterChipProps) => (
  <AvatarChip
    placeholderColorSeed={filter.value}
    name={filter.displayValue}
    avatarType="rounded"
    avatarUrl={filter.displayAvatarUrl}
    LeftIcon={Icon}
  />
);
