import {
  EntityChip,
  EntityChipVariant,
} from '@/ui/display/chip/components/EntityChip';

type CompanyChipProps = {
  id: string;
  name: string;
  avatarUrl?: string;
  variant?: EntityChipVariant;
};

export const CompanyChip = ({
  id,
  name,
  avatarUrl,
  variant = EntityChipVariant.Regular,
}: CompanyChipProps) => (
  <EntityChip
    entityId={id}
    linkToEntity={`/object/company/${id}`}
    name={name}
    avatarType="squared"
    avatarUrl={avatarUrl}
    variant={variant}
  />
);
