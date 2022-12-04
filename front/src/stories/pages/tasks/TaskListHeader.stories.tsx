import { MemoryRouter } from 'react-router-dom';
import TaskListHeader from '../../../pages/tasks/TaskListHeader';

export default {
  title: 'Tasks',
  component: TaskListHeader,
};

export const TaskListHeaderDefault = () => <TaskListHeader />;
