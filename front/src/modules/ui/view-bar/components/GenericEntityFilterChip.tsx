import { EntityChip } from '@/ui/chip/components/EntityChip';

import { Filter } from '../types/Filter';

type OwnProps = {
  filter: Filter;
};

export const GenericEntityFilterChip = ({ filter }: OwnProps) => (
  <EntityChip
    entityId={filter.value}
    name={filter.displayValue}
    avatarType="rounded"
    pictureUrl={filter.displayAvatarUrl}
  />
);
