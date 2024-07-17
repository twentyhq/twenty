import { AvatarChip } from 'twenty-ui';

import { getImageAbsoluteURI } from '~/utils/image/getImageAbsoluteURI';

export type UserChipProps = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export const UserChip = ({ id, name, avatarUrl }: UserChipProps) => (
  <AvatarChip
    placeholderColorSeed={id}
    name={name}
    avatarType="rounded"
    avatarUrl={getImageAbsoluteURI(avatarUrl) || ''}
  />
);
