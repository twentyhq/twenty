import { render } from '@testing-library/react';

import { TasksDefault } from '../../../stories/pages/tasks/Tasks.stories';

it('Checks the Tasks page render', () => {
  const { getAllByRole } = render(<TasksDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Sylvie Vartan');
});
