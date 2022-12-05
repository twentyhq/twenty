import { render } from '@testing-library/react';

import { TaskListDefault } from '../../../stories/pages/inbox/TaskList.stories';

it('Checks the task list render', () => {
  const { getAllByRole } = render(<TaskListDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Sylvie Vartan');
});
