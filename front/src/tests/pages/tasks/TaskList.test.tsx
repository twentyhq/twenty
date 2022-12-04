import { render } from '@testing-library/react';

import { TaskListDefault } from '../../../stories/pages/tasks/TaskList.stories';

it('Checks the Tasks page render', () => {
  const { getAllByRole } = render(<TaskListDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Sylvie Vartan');
});
