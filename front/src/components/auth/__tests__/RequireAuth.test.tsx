import { render } from '@testing-library/react';

import { RequireAuthWithHelloChild } from '../__stories__/RequireAuth.stories';

it('Checks the Require Auth renders', () => {
  const { getAllByText } = render(<RequireAuthWithHelloChild />);

  expect(getAllByText('Hello')).toBeTruthy();
});
