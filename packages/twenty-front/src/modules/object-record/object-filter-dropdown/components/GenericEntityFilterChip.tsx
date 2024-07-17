import { AvatarChip, IconComponent } from 'twenty-ui';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

import { Filter } from '../types/Filter';

type GenericEntityFilterChipProps = {
  filter: Filter;
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
    avatarUrl={getImageAbsoluteURI(filter.displayAvatarUrl) || ''}
    LeftIcon={Icon}
  />
);
