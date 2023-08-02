import { ChipSize } from '@/ui/chip/components/Chip';
import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
  size?: ChipSize;
  avatarSize?: number;
};

export function CompanyChip({
  id,
  name,
  pictureUrl,
  variant = EntityChipVariant.Regular,
  size,
  avatarSize,
}: OwnProps) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/companies/${id}`}
      name={name}
      avatarType="squared"
      pictureUrl={pictureUrl}
      variant={variant}
      size={size}
      avatarSize={avatarSize}
    />
  );
}
