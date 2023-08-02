import { useTasks } from '../hooks/useTasks';

import { TaskList } from './TaskList';

export function TaskGroups() {
  const { todayOrPreviousTasks, upcomingTasks } = useTasks();
  return (
    <>
      <TaskList title="Today" tasks={todayOrPreviousTasks ?? []} />
      <TaskList title="Upcoming" tasks={upcomingTasks ?? []} />
    </>
  );
}
