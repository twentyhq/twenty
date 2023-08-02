import { ChipSize } from '@/ui/chip/components/Chip';
import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

export type PersonChipPropsType = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
  size?: ChipSize;
  avatarSize?: number;
};

export function PersonChip({
  id,
  name,
  pictureUrl,
  variant,
  size,
  avatarSize,
}: PersonChipPropsType) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/person/${id}`}
      name={name}
      avatarType="rounded"
      pictureUrl={pictureUrl}
      variant={variant}
      size={size}
      avatarSize={avatarSize}
    />
  );
}
