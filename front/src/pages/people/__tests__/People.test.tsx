import { render } from '@testing-library/react';

import { PeopleDefault } from '../__stories__/People.stories';

it('Checks the People page render', () => {
  const { getByTestId } = render(<PeopleDefault />);

  const title = getByTestId('top-bar-title');
  expect(title).toHaveTextContent('People');
});
