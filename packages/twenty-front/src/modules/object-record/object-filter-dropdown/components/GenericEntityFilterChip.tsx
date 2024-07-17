import { AvatarChip, IconComponent } from 'twenty-ui';

import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

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
    avatarUrl={getImageAbsoluteURIOrBase64(filter.displayAvatarUrl) || ''}
    LeftIcon={Icon}
  />
);
