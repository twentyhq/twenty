import { render } from '@testing-library/react';

import { ListPanelHeaderDefault } from '../__stories__/ListPanelHeader.stories';

it('Checks the ListPanelHeader render', () => {
  const { getAllByText } = render(<ListPanelHeaderDefault />);

  const text = getAllByText('6 tasks waiting');
  expect(text).toBeDefined();
});
