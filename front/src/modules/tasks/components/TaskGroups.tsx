import { useTasks } from '../hooks/useTasks';

import { TaskList } from './TaskList';

export function TaskGroups() {
  const { todayTasks, otherTasks } = useTasks();
  return (
    <>
      <TaskList title="Today" tasks={todayTasks ?? []} />
      <TaskList title="Others" tasks={otherTasks ?? []} />
    </>
  );
}
