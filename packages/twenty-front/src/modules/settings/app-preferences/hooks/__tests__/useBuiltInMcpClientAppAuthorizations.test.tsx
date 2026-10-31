import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';

import { BUILT_IN_MCP_CLIENT_APPS } from '@/settings/app-preferences/constants/BuiltInMcpClientApps';
import { useBuiltInMcpClientAppAuthorizations } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppAuthorizations';
import { CurrentUserApplicationAuthorizationsDocument } from '~/generated-metadata/graphql';

const CLAUDE_APP = BUILT_IN_MCP_CLIENT_APPS[1];

const CLAUDE_AUTHORIZATION = {
  __typename: 'ApplicationAuthorization',
  id: 'claude-authorization-id',
  applicationId: 'claude-application-id',
  applicationName: 'Claude',
  scopes: ['api', 'profile'],
  redirectUriHostnames: ['claude.ai'],
  lastAuthorizedAt: '2026-10-12T09:00:00.000Z',
  lastUsedAt: '2026-10-12T09:00:00.000Z',
  createdAt: '2026-10-12T09:00:00.000Z',
};

const renderUseBuiltInMcpClientAppAuthorizations = (
  result: Record<string, unknown>,
) =>
  renderHook(() => useBuiltInMcpClientAppAuthorizations(CLAUDE_APP), {
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

describe('useBuiltInMcpClientAppAuthorizations', () => {
  it('returns the connections of the app once loaded', async () => {
    const { result } = renderUseBuiltInMcpClientAppAuthorizations({
      data: { currentUserApplicationAuthorizations: [CLAUDE_AUTHORIZATION] },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.hasLoadError).toBe(false);
    expect(result.current.authorizations.map(({ id }) => id)).toEqual([
      'claude-authorization-id',
    ]);
  });

  it('reports a load error instead of an empty list when the request fails', async () => {
    const { result } = renderUseBuiltInMcpClientAppAuthorizations({
      errors: [new GraphQLError('Internal server error')],
    });

    await waitFor(() => expect(result.current.hasLoadError).toBe(true));

    expect(result.current.loading).toBe(false);
    expect(result.current.authorizations).toEqual([]);
  });
});
