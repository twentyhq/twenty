import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ActivityType } from '~/generated/graphql';

export const PageAddTaskButton = () => {
  const openCreateActivity = useOpenCreateActivityDrawer();

  const filters = useRecoilScopedValue(
    filtersScopedState,
    TasksRecoilScopeContext,
  );

  const assigneeIdFilter = filters.find(
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
