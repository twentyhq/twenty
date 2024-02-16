import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';

type PageAddTaskButtonProps = {
  filterDropdownId: string;
};

export const PageAddTaskButton = ({
  filterDropdownId,
}: PageAddTaskButtonProps) => {
  const { selectedFilter } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

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
