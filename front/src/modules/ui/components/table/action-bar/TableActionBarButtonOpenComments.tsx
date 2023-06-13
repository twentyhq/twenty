import { IconComment } from '@/ui/icons/index';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleComments({ onClick }: OwnProps) {
  return (
    <EntityTableActionBarButton
      label="Comment"
      icon={<IconComment size={16} />}
      onClick={onClick}
    />
  );
}
