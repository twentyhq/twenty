import { IconNotes } from '@/ui/icons/index';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleComments({ onClick }: OwnProps) {
  return (
    <EntityTableActionBarButton
      label="Notes"
      icon={<IconNotes size={16} />}
      onClick={onClick}
    />
  );
}
