import { FaRegComment } from 'react-icons/fa';
import { EntityTableActionBarButton } from './EntityTableActionBarButton';
import { useOpenRightDrawer } from '../../../modules/ui/layout/right-drawer/hooks/useOpenRightDrawer';

export function TableActionBarButtonToggleComments() {
  const openRightDrawer = useOpenRightDrawer();

  async function handleButtonClick() {
    openRightDrawer('comments');
  }

  return (
    <EntityTableActionBarButton
      label="Comment"
      icon={<FaRegComment size={16} />}
      onClick={handleButtonClick}
    />
  );
}
