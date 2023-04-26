import { render } from '@testing-library/react';

import { CallbackDefault } from '../__stories__/Callback.stories';
import { act } from 'react-dom/test-utils';

it('Checks the Callback page render', async () => {
  await act(async () => {
    render(<CallbackDefault />);
  });
});
