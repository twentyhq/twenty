import { render } from '@testing-library/react';

import { CallbackDefault } from '../__stories__/Callback.stories';

jest.mock('../../../hooks/auth/useRefreshToken', () => ({
  useRefreshToken: () => ({ loading: false }),
}));

it('Checks the Callback page render', () => {
  render(<CallbackDefault />);
});

afterEach(() => {
  jest.clearAllMocks();
});
