import { ChipVariantType, EntityChip } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  picture?: string;
  clickable?: boolean;
  variant?: ChipVariantType;
};

export function CompanyChip({
  id,
  name,
  picture,
  clickable,
  variant = ChipVariantType.opaque,
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
