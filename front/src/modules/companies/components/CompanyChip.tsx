import { ChipSize } from '@/ui/chip/components/Chip';
import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';
import { AvatarSize } from '@/users/components/Avatar';

type OwnProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
  size?: ChipSize;
  avatarSize?: AvatarSize;
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
