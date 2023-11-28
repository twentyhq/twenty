import { isNonEmptyString } from '@sniptt/guards';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

type PageAddTaskButtonProps = {
  filterId: string;
};

export const PageAddTaskButton = ({ filterId }: PageAddTaskButtonProps) => {
  const { selectedFilter } = useFilter({
    filterScopeId: filterId,
  });
  const openCreateActivity = useOpenCreateActivityDrawer();

  const handleClick = () => {
    openCreateActivity({
      type: 'Task',
      assigneeId: isNonEmptyString(selectedFilter?.value)
        ? selectedFilter?.value
        : undefined,
    });
  };

  return <PageAddButton onClick={handleClick} />;
};
