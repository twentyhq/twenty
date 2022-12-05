import { render } from '@testing-library/react';

import { InboxDefault } from '../__stories__/Inbox.stories';

it('Checks the Inbox page render', () => {
  const { getAllByRole } = render(<InboxDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Sylvie Vartan');
});
