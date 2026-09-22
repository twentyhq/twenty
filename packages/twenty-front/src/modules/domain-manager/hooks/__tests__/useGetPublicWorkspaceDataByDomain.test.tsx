import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { type ReactNode } from 'react';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { GetPublicWorkspaceDataByDomainDocument } from '~/generated-metadata/graphql';

const redirectToDefaultDomainSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirectToDefaultDomain', () => ({
  useRedirectToDefaultDomain: jest.fn().mockImplementation(() => ({
    redirectToDefaultDomain: redirectToDefaultDomainSpy,
  })),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain', () => ({
  useIsCurrentLocationOnDefaultDomain: jest.fn().mockImplementation(() => ({
    isDefaultDomain: false,
  })),
}));

jest.mock('@/domain-manager/hooks/useOrigin', () => ({
  useOrigin: jest.fn().mockImplementation(() => ({
    origin: 'https://old-acme.twenty.com',
  })),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GetPublicWorkspaceDataByDomainDocument,
          variables: { origin: 'https://old-acme.twenty.com' },
        },
        result: {
          errors: [
            {
              message: 'Workspace not found',
              extensions: { code: 'NOT_FOUND' },
            },
          ],
        },
      },
    ]}
  >
    {children}
  </MockedProvider>
);

describe('useGetPublicWorkspaceDataByDomain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getDefaultStore().set(isMultiWorkspaceEnabledState.atom, true);
    getDefaultStore().set(clientConfigApiStatusState.atom, {
      isLoadedOnce: true,
      isLoading: false,
      isErrored: false,
      isSaved: true,
    });
  });

  it('sends an unknown workspace url to the default domain without asking it to stay', async () => {
    renderHook(() => useGetPublicWorkspaceDataByDomain(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(redirectToDefaultDomainSpy).toHaveBeenCalledTimes(1);
    });
    expect(redirectToDefaultDomainSpy).toHaveBeenCalledWith({
      shouldStayOnDefaultDomain: false,
    });
  });
});
