import { render } from '@testing-library/react';

import { ComposerSwithDefault } from '../__stories__/ComposerSwitch.stories';

it('Checks the composer switch render', () => {
  const { getAllByRole } = render(<ComposerSwithDefault />);

  const button = getAllByRole('button');
  expect(button[0]).toHaveTextContent('Reply');
});
