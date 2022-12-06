import { render } from '@testing-library/react';

import { MessageDefault } from '../__stories__/Message.stories';

it('Checks the booking event render', () => {
  const { getAllByText } = render(<MessageDefault />);

  const text = getAllByText('Georges Alain');
  expect(text).toBeDefined();
});
