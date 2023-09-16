import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { PageAddButton } from '@/ui/layout/components/PageAddButton';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
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

  return (
    <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
      <PageAddButton onClick={handleClick} />
    </RecoilScope>
  );
};
