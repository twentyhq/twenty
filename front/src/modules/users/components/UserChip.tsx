import { EntityChip } from '@/ui/chip/components/EntityChip';

export type UserChipProps = {
  id: string;
  name: string;
  pictureUrl?: string;
};

export function UserChip({ id, name, pictureUrl }: UserChipProps) {
  return (
    <EntityChip
      entityId={id}
      name={name}
      avatarType="rounded"
      pictureUrl={pictureUrl}
    />
  );
}
