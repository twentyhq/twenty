import { IconNotes } from '@/ui/icon/index';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleComments({ onClick }: OwnProps) {
  return (
    <EntityTableActionBarButton
      label="Note"
      icon={<IconNotes size={16} />}
      onClick={onClick}
    />
  );
}
