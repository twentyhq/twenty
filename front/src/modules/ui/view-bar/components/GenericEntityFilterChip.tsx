import { EntityChip } from '@/ui/chip/components/EntityChip';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { Filter } from '../types/Filter';

type OwnProps = {
  filter: Filter;
  Icon?: IconComponent;
};

export const GenericEntityFilterChip = ({ filter, Icon }: OwnProps) => (
  <EntityChip
    entityId={filter.value}
    name={filter.displayValue}
    avatarType="rounded"
    pictureUrl={filter.displayAvatarUrl}
    LeftIcon={Icon}
  />
);
