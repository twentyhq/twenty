import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
};

export function CompanyChip({
  id,
  name,
  pictureUrl,
  variant = EntityChipVariant.Regular,
}: OwnProps) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/companies/${id}`}
      name={name}
      avatarType="squared"
      pictureUrl={pictureUrl}
      variant={variant}
    />
  );
}
