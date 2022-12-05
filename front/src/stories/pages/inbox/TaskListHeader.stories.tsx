import { MemoryRouter } from 'react-router-dom';
import TaskListHeader from '../../../pages/inbox/TaskListHeader';

export default {
  title: 'Inbox',
  component: TaskListHeader,
};

export const TaskListHeaderDefault = () => <TaskListHeader />;
