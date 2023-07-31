import { useTasks } from '../hooks/useTasks';

import { TaskList } from './TaskList';

export function TaskGroups() {
  const { todayTasks, thisWeekTasks } = useTasks();
  return (
    <>
      <TaskList title="Today" tasks={todayTasks ?? []} />
      <TaskList title="This week" tasks={thisWeekTasks ?? []} />
    </>
  );
}
