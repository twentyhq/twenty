import { render } from '@testing-library/react';

import { RegularTableHeader } from '../__stories__/TableHeader.stories';

it('Checks the TableHeader renders', () => {
  const { getByText } = render(<RegularTableHeader />);

  expect(getByText('Test')).toBeDefined();
});
