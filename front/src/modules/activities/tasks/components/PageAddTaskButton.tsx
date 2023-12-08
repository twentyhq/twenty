import { isNonEmptyString } from '@sniptt/guards';

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
