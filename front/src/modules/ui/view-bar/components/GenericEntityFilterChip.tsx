import { EntityChip } from '@/ui/chip/components/EntityChip';

import { Filter } from '../types/Filter';

type OwnProps = {
  filter: Filter;
};

export function GenericEntityFilterChip({ filter }: OwnProps) {
  return (
    <EntityChip
      entityId={filter.value}
      name={filter.displayValue}
      avatarType="rounded"
      pictureUrl={filter.displayAvatarUrl}
    />
  );
}
