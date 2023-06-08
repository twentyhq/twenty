import { FaRegComment } from 'react-icons/fa';
import { useRecoilState } from 'recoil';

import { useOpenRightDrawer } from '@/ui/layout/right-drawer/hooks/useOpenRightDrawer';
import { currentRowSelectionState } from '@/ui/tables/states/rowSelectionState';

import { EntityTableActionBarButton } from './EntityTableActionBarButton';

type OwnProps = {
  onClick: () => void;
};

export function TableActionBarButtonToggleComments({ onClick }: OwnProps) {
  // TODO: here it would be nice to access the table context
  // But let's see when we have custom entities and properties
  const openRightDrawer = useOpenRightDrawer();

  const [currentRowSelection] = useRecoilState(currentRowSelectionState);

  console.log({ currentRowSelection });

  async function handleButtonClick() {
    openRightDrawer('create-comment-thread');
  }

  return (
    <EntityTableActionBarButton
      label="Comment"
      icon={<FaRegComment size={16} />}
      onClick={onClick}
    />
  );
}
