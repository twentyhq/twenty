import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

export const PageAddTaskButton = () => {
  const { selectedFilter } = useFilter();
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleClick = () => {
    openCreateActivity({
      type: 'Task',
      assigneeId: selectedFilter?.value,
    });
  };

  return <PageAddButton onClick={handleClick} />;
};
