import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

type CompanyChipProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
};

export const CompanyChip = ({
  id,
  name,
  pictureUrl,
  variant = EntityChipVariant.Regular,
}: CompanyChipProps) => (
  <EntityChip
    entityId={id}
    linkToEntity={`/companies/${id}`}
    name={name}
    avatarType="squared"
    pictureUrl={pictureUrl}
    variant={variant}
  />
);
