import {
  EntityChip,
  EntityChipVariant,
} from '@/ui/display/chip/components/EntityChip';

type CompanyChipProps = {
  opportunityId: string;
  companyName: string;
  avatarUrl?: string;
  variant?: EntityChipVariant;
};

export const CompanyChip = ({
  opportunityId,
  companyName,
  avatarUrl,
  variant = EntityChipVariant.Regular,
}: CompanyChipProps) => (
  <EntityChip
    entityId={opportunityId}
    linkToEntity={`/object/opportunity/${opportunityId}`}
    name={companyName}
    avatarType="squared"
    avatarUrl={avatarUrl}
    variant={variant}
  />
);
