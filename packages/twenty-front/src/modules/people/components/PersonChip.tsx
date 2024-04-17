import { EntityChip, EntityChipVariant } from 'twenty-ui';

import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export type PersonChipProps = {
  id: string;
  name: string;
  avatarUrl?: string;
  variant?: EntityChipVariant;
};

export const PersonChip = ({
  id,
  name,
  avatarUrl,
  variant,
}: PersonChipProps) => (
  <EntityChip
    entityId={id}
    linkToEntity={`/person/${id}`}
    name={name}
    avatarType="rounded"
    avatarUrl={getImageAbsoluteURIOrBase64(avatarUrl) || ''}
    variant={variant}
  />
);
