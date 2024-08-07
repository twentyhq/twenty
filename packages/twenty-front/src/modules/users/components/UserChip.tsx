import { AvatarChip } from 'twenty-ui';

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
    avatarUrl={avatarUrl}
  />
);
