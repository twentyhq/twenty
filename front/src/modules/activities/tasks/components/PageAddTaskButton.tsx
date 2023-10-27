import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { ActivityType } from '~/generated/graphql';

export const PageAddTaskButton = () => {
  const { selectedFilters } = useFilter();
  const openCreateActivity = useOpenCreateActivityDrawer();

  const assigneeIdFilter = selectedFilters.find(
    (filter) => filter.key === 'assigneeId',
  );

  const handleClick = () => {
    openCreateActivity({
      type: ActivityType.Task,
      assigneeId: assigneeIdFilter?.value,
    });
  };

  return <PageAddButton onClick={handleClick} />;
};
