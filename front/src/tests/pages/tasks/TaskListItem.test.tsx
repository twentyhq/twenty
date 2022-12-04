import { render } from '@testing-library/react';

import { TaskListItemDefault } from '../../../stories/pages/tasks/TaskListItem.stories';

it('Checks the TaskListItem render', () => {
  const { getAllByText } = render(<TaskListItemDefault />);

  const text = getAllByText('Sylvie Vartan');
  expect(text).toBeDefined();
});
