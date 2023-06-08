import { FaRegComment } from 'react-icons/fa';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleComments({ onClick }: OwnProps) {
  return (
    <EntityTableActionBarButton
      label="Comment"
      icon={<FaRegComment size={16} />}
      onClick={onClick}
    />
  );
}
