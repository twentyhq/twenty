import { MemoryRouter } from 'react-router-dom';
import TaskListItem from '../../../pages/tasks/TaskListItem';

export default {
  title: 'Tasks',
  component: TaskListItem,
};

export const TaskListItemDefault = () => (
  <TaskListItem
    task={{
      id: 1,
      targetUser: 'Sylvie Vartan',
      label: 'Guest at #xxx property',
      time: '3h',
      lastMessage:
        'I’m looking for my order but couldn’t find it. Could you help me find it. I don’t know where ...',
    }}
  />
);
