import { ActionBar } from '@/ui/navigation/action-menu/components/ActionBar';
import { ContextMenu } from '@/ui/navigation/action-menu/components/ContextMenu';
import { NavigationModal } from '@/ui/navigation/action-menu/components/NavigationModal';

export const ActionMenu = () => {
  return (
    <>
      <ActionBar />
      <ContextMenu />
      <NavigationModal />
    </>
  );
};
