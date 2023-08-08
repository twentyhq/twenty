import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

export type PersonChipPropsType = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
};

export function PersonChip({
  id,
  name,
  pictureUrl,
  variant,
}: PersonChipPropsType) {
  //console.log(id, name, pictureUrl, variant);
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/person/${id}`}
      name={name}
      avatarType="rounded"
      pictureUrl={pictureUrl}
      variant={variant}
    />
  );
}
