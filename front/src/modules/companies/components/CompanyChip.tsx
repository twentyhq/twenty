import { EntityChip } from '@/ui/chip/components/EntityChip';

type OwnProps = {
  id: string;
  name: string;
  picture?: string;
  clickable?: boolean;
  customColor?: string;
};

export function CompanyChip({
  id,
  name,
  picture,
  clickable,
  customColor,
}: OwnProps) {
  return (
    <EntityChip
      entityId={id}
      linkToEntity={`/companies/${id}`}
      name={name}
      avatarType="squared"
      clickable={clickable}
      picture={picture}
      customColor={customColor}
    />
  );
}
