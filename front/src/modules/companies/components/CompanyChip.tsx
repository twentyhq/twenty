import { EntityChip } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  pictureUrl?: string;
  clickable?: boolean;
};

export function CompanyChip({
  id,
  name,
  pictureUrl,
  clickable = true,
}: OwnProps) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={clickable ? `/companies/${id}` : undefined}
      name={name}
      avatarType="squared"
      pictureUrl={pictureUrl}
    />
  );
}
