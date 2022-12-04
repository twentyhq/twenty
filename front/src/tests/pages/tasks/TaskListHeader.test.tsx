import { render } from '@testing-library/react';

import { TaskListHeaderDefault } from '../../../stories/pages/tasks/TaskListHeader.stories';

it('Checks the TaskListHeader render', () => {
  const { getAllByText } = render(<TaskListHeaderDefault />);

  const text = getAllByText('6 tasks waiting');
  expect(text).toBeDefined();
});
