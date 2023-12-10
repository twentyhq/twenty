import {
  EntityChip,
  EntityChipVariant,
} from '@/ui/display/chip/components/EntityChip';

export type PersonChipProps = {
  id: string;
  name: string;
  avatarUrl?: string;
  variant?: EntityChipVariant;
};

export const PersonChip = ({
  id,
  name,
  avatarUrl,
  variant,
}: PersonChipProps) => (
  <EntityChip
    entityId={id}
    linkToEntity={`/person/${id}`}
    name={name}
    avatarType="rounded"
    avatarUrl={avatarUrl}
    variant={variant}
  />
);
