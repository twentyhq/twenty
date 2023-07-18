import { ChipVariant, EntityChip } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  picture?: string;
  clickable?: boolean;
  variant?: ChipVariant;
};

export function CompanyChip({
  id,
  name,
  picture,
  clickable,
  variant = ChipVariant.opaque,
}: OwnProps) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/companies/${id}`}
      name={name}
      avatarType="squared"
      clickable={clickable}
      picture={picture}
      variant={variant}
    />
  );
}
