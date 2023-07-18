import { EntityChip } from '@/ui/chip/components/EntityChip';

export type PersonChipPropsType = {
  id: string;
  name: string;
  picture?: string;
  clickable?: boolean;
};

export function PersonChip({
  id,
  name,
  picture,
  clickable,
}: PersonChipPropsType) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/person/${id}`}
      name={name}
      avatarType="rounded"
      clickable={clickable}
      picture={picture}
    />
  );
}
