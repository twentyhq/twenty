import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { type ReactNode } from 'react';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useGetPublicWorkspaceDataByDomain } from '@/domain-manager/hooks/useGetPublicWorkspaceDataByDomain';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { GetPublicWorkspaceDataByDomainDocument } from '~/generated-metadata/graphql';

const redirectSpy = jest.fn();

jest.mock('@/domain-manager/hooks/useRedirect', () => ({
  useRedirect: jest.fn().mockImplementation(() => ({
    redirect: redirectSpy,
  })),
}));

jest.mock('@/domain-manager/hooks/useIsCurrentLocationOnDefaultDomain', () => ({
  useIsCurrentLocationOnDefaultDomain: jest.fn().mockImplementation(() => ({
    isDefaultDomain: false,
  })),
}));

jest.mock('@/domain-manager/hooks/useOrigin', () => ({
  useOrigin: jest.fn(),
}));

const buildWrapper =
  (origin: string) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GetPublicWorkspaceDataByDomainDocument,
            variables: { origin },
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
    getDefaultStore().set(domainConfigurationState.atom, {
      frontDomain: 'twenty.com',
      defaultSubdomain: 'app',
      publicFunctionDomain: undefined,
    });
  });

  // The default domain cannot clear a cookie pointing at a custom domain, so
  // without the marker it would bounce straight back to the missing workspace
  it.each([
    ['a subdomain', 'https://old-acme.twenty.com'],
    ['a custom domain', 'https://crm.old-acme.com'],
  ])(
    'asks the default domain to stay when the workspace on %s is not found',
    async (_label, origin) => {
      jest.mocked(useOrigin).mockReturnValue({ origin });

      renderHook(() => useGetPublicWorkspaceDataByDomain(), {
        wrapper: buildWrapper(origin),
      });

      await waitFor(() => {
        expect(redirectSpy).toHaveBeenCalledTimes(1);
      });
      const redirectedUrl = new URL(redirectSpy.mock.calls[0][0]);
      expect(redirectedUrl.hostname).toBe('app.twenty.com');
      expect(redirectedUrl.searchParams.get('stayOnDefaultDomain')).toBe(
        'true',
      );
    },
  );
});
