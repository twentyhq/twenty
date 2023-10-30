import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { ActivityType } from '~/generated/graphql';

export const PageAddTaskButton = () => {
  const { selectedFilter } = useFilter();
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleClick = () => {
    openCreateActivity({
      type: ActivityType.Task,
      assigneeId: selectedFilter?.value,
    });
  };

  return <PageAddButton onClick={handleClick} />;
};
