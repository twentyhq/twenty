import { render } from '@testing-library/react';

import { AppLayoutDefault } from '../__stories__/AppLayout.stories';

it('Checks the AppLayout render', () => {
  const { getByTestId } = render(<AppLayoutDefault />);

  const title = getByTestId('content');
  expect(title).toHaveTextContent('Test');
});
