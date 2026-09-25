import { StrictMode } from 'react';
import { render } from '@testing-library/react';

import { ClientConfigProviderEffect } from '@/client-config/components/ClientConfigProviderEffect';

const initializeClientConfig = jest.fn();

jest.mock('@/client-config/hooks/useClientConfig', () => ({
  useClientConfig: () => ({ initializeClientConfig }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomState', () => ({
  useAtomState: () => [{ isLoadedOnce: false, isLoading: false }, jest.fn()],
}));

it('initializes once when StrictMode replays startup effects', () => {
  render(
    <StrictMode>
      <ClientConfigProviderEffect />
    </StrictMode>,
  );

  expect(initializeClientConfig).toHaveBeenCalledTimes(1);
});
