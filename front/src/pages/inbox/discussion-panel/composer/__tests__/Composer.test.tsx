import { render } from '@testing-library/react';

import { ComposerDefault } from '../__stories__/Composer.stories';

it('Checks the composer render', () => {
  const { getAllByRole } = render(<ComposerDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Reply');
});
