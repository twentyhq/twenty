import { render } from '@testing-library/react';

import { ListPanelDefault } from '../__stories__/ListPanel.stories';

it('Checks the task list render', () => {
  const { getAllByRole } = render(<ListPanelDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Sylvie Vartan');
});
