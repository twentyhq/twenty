import { RecordFilter } from '../../record-filter/types/RecordFilter';
import { AvatarChip } from 'twenty-ui/components';
import { IconComponent } from 'twenty-ui/display';

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
