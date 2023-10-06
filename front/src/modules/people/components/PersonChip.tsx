import { EntityChip, EntityChipVariant } from '@/ui/chip/components/EntityChip';

export type PersonChipProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  variant?: EntityChipVariant;
};

export const PersonChip = ({
  id,
  name,
  pictureUrl,
  variant,
}: PersonChipProps) => (
  <EntityChip
    entityId={id}
    linkToEntity={`/person/${id}`}
    name={name}
    avatarType="rounded"
    pictureUrl={pictureUrl}
    variant={variant}
  />
);
