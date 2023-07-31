import { activeTabIdScopedState } from '@/ui/tab/states/activeTabIdScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { TasksContext } from '../states/TasksContext';

type OwnProps = {
  tasks: [];
};

export function TaskList({ tasks }: OwnProps) {
  console.log(tasks);
  const [activeTabId] = useRecoilScopedState(
    activeTabIdScopedState,
    TasksContext,
  );
  return <>TaskList {activeTabId}</>;
}
