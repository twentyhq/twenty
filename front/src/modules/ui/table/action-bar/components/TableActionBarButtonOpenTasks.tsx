import { IconCheckbox } from '@/ui/icon/index';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleTasks({ onClick }: OwnProps) {
  return (
    <EntityTableActionBarButton
      label="Task"
      icon={<IconCheckbox size={16} />}
      onClick={onClick}
    />
  );
}
