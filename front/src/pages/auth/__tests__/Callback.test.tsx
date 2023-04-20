import { render } from '@testing-library/react';

import { CallbackDefault } from '../__stories__/Callback.stories';

it('Checks the Callback page render', () => {
  render(<CallbackDefault />);
});
