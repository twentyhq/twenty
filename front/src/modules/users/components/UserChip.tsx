import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export type UserChipProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  commentsCount: number;
};

export const UserChip = ({
  id,
  name,
  pictureUrl,
  commentsCount,
}: UserChipProps) => (
  <EntityChip
    entityId={id}
    name={name}
    avatarType="rounded"
    pictureUrl={pictureUrl}
    commentsCount={commentsCount}
  />
);
