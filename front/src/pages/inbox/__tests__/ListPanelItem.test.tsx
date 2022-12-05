import { render } from '@testing-library/react';

import { ListPanelItemDefault } from '../__stories__/ListPanelItem.stories';

it('Checks the ListPanelItem render', () => {
  const { getAllByText } = render(<ListPanelItemDefault />);

  const text = getAllByText('Sylvie Vartan');
  expect(text).toBeDefined();
});
