import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export type UserChipProps = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export const UserChip = ({ id, name, avatarUrl }: UserChipProps) => (
  <EntityChip
    entityId={id}
    name={name}
    avatarType="rounded"
    avatarUrl={avatarUrl}
  />
);
