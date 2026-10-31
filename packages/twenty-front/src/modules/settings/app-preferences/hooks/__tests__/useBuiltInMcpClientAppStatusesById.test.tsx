import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';

import { useBuiltInMcpClientAppStatusesById } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppStatusesById';
import {
  CurrentUserApplicationAuthorizationsDocument,
  WellKnownOAuthClient,
} from '~/generated-metadata/graphql';

const CLAUDE_AUTHORIZATION = {
  __typename: 'ApplicationAuthorization',
  id: 'claude-authorization-id',
  scopes: ['api', 'profile'],
  wellKnownOAuthClient: WellKnownOAuthClient.CLAUDE,
  lastUsedAt: '2026-10-12T09:00:00.000Z',
};

const renderUseBuiltInMcpClientAppStatusesById = (
  result: MockedResponse['result'],
) =>
  renderHook(() => useBuiltInMcpClientAppStatusesById(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider
        mocks={[
          {
            request: { query: CurrentUserApplicationAuthorizationsDocument },
            result,
          },
        ]}
      >
        {children}
      </MockedProvider>
    ),
  });

describe('useBuiltInMcpClientAppStatusesById', () => {
  it('marks only the apps the member has not connected', async () => {
    const { result } = renderUseBuiltInMcpClientAppStatusesById({
      data: { currentUserApplicationAuthorizations: [CLAUDE_AUTHORIZATION] },
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        chatgpt: [{ type: 'notConnected' }],
      }),
    );
  });

  it('shows no status rather than a wrong one when the request fails', async () => {
    const { result } = renderUseBuiltInMcpClientAppStatusesById({
      errors: [new GraphQLError('Internal server error')],
    });

    await waitFor(() => expect(result.current).toEqual({}));
  });
});
