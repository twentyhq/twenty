import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';

export const PageAddTaskButton = () => {
  const openCreateActivity = useOpenCreateActivityDrawer();

  // TODO: fetch workspace member from filter here

  const handleClick = () => {
    openCreateActivity({
      type: 'Task',
      targetableObjects: [],
    });
  };

  return <PageAddButton onClick={handleClick} />;
};
