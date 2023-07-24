import { EntityChip } from '@/ui/chip/components/EntityChip';

export type PersonChipPropsType = {
  id: string;
  name: string;
  pictureUrl?: string;
  clickable?: boolean;
};

export function PersonChip({
  id,
  name,
  pictureUrl,
  clickable = true,
}: PersonChipPropsType) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={clickable ? `/person/${id}` : undefined}
      name={name}
      avatarType="rounded"
      pictureUrl={pictureUrl}
    />
  );
}
