import { FaRegComment } from 'react-icons/fa';
import { EntityTableActionBarButton } from './EntityTableActionBarButton';
import { useOpenRightDrawer } from '../../../modules/ui/layout/right-drawer/hooks/useOpenRightDrawer';

export function TableActionBarButtonToggleComments() {
  // TODO: here it would be nice to access the table context
  // But let's see when we have custom entities and properties
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
