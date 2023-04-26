import { render } from '@testing-library/react';

import { OpportunitiesDefault } from '../__stories__/Opportunities.stories';

it('Checks the Companies page render', () => {
  const { getByTestId } = render(<OpportunitiesDefault />);

  const title = getByTestId('top-bar-title');
  expect(title).toHaveTextContent('Opportunities');
});
