import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

export type UserChipPropsType = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
};

export function UserChip({ id, name, pictureUrl, variant }: UserChipPropsType) {
  return (
    <EntityChip
      entityId={id}
      name={name}
      avatarType="rounded"
      pictureUrl={pictureUrl}
    />
  );
}
