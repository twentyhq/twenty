import { MemoryRouter } from 'react-router-dom';
import Tasks from '../../../pages/tasks/Tasks';

export default {
  title: 'Tasks',
  component: Tasks,
};

export const TasksDefault = () => (
  <MemoryRouter>
    <Tasks />
  </MemoryRouter>
);
