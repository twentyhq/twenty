import { i18n } from '@lingui/core';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { assertConnectionScopeAllowedByProviderOrThrow } from 'src/engine/core-modules/application/connection-provider/utils/assert-connection-scope-allowed-by-provider-or-throw.util';

const userProvider = {
  name: 'linear',
  displayName: 'Linear',
  scope: 'USER' as const,
};

const workspaceProvider = {
  name: 'slack',
  displayName: 'Slack',
  scope: 'WORKSPACE' as const,
};

const catchException = (assertion: () => void): ConnectionProviderException => {
  try {
    assertion();
  } catch (error) {
    if (error instanceof ConnectionProviderException) {
      return error;
    }

    throw error;
  }

  throw new Error('Expected a ConnectionProviderException');
};

describe('assertConnectionScopeAllowedByProviderOrThrow', () => {
  beforeAll(() => {
    i18n.loadAndActivate({ locale: 'en', messages: {} });
  });

  it.each([
    ['USER', userProvider],
    ['WORKSPACE', workspaceProvider],
  ] as const)(
    'accepts a new %s connection on a provider with the same scope',
    (scope, connectionProvider) => {
      expect(() =>
        assertConnectionScopeAllowedByProviderOrThrow({
          connectionProvider,
          scope,
          reconnectTarget: null,
        }),
      ).not.toThrow();
    },
  );

  it.each([
    { scope: 'USER', connectionProvider: userProvider },
    { scope: 'USER', connectionProvider: workspaceProvider },
    { scope: 'WORKSPACE', connectionProvider: userProvider },
    { scope: 'WORKSPACE', connectionProvider: workspaceProvider },
  ] as const)(
    'accepts a reconnect that keeps an existing $scope scope on a $connectionProvider.scope provider',
    ({ scope, connectionProvider }) => {
      expect(() =>
        assertConnectionScopeAllowedByProviderOrThrow({
          connectionProvider,
          scope,
          reconnectTarget: { scope },
        }),
      ).not.toThrow();
    },
  );

  it('refuses to share a personal connection even when the provider is workspace-scoped', () => {
    const exception = catchException(() =>
      assertConnectionScopeAllowedByProviderOrThrow({
        connectionProvider: workspaceProvider,
        scope: 'WORKSPACE',
        reconnectTarget: { scope: 'USER' },
      }),
    );

    expect(exception.code).toBe(
      ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
    );
    expect(exception.message).toBe(
      'Cannot reconnect a USER connection of provider "slack" as WORKSPACE: a reconnect keeps the connection\'s scope',
    );
    expect(i18n._(exception.userFriendlyMessage)).toBe(
      'This Slack connection is personal. Reconnecting keeps it personal.',
    );
  });

  it('refuses to make a shared connection personal even when the provider is user-scoped', () => {
    const exception = catchException(() =>
      assertConnectionScopeAllowedByProviderOrThrow({
        connectionProvider: userProvider,
        scope: 'USER',
        reconnectTarget: { scope: 'WORKSPACE' },
      }),
    );

    expect(exception.code).toBe(
      ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
    );
    expect(i18n._(exception.userFriendlyMessage)).toBe(
      'This Linear connection is shared with the workspace. Reconnecting keeps it shared.',
    );
  });

  it.each([
    ['USER', 'WORKSPACE', userProvider],
    ['WORKSPACE', 'USER', workspaceProvider],
  ] as const)(
    'refuses to move a %s connection to %s on a reconnect',
    (targetScope, scope, connectionProvider) => {
      const exception = catchException(() =>
        assertConnectionScopeAllowedByProviderOrThrow({
          connectionProvider,
          scope,
          reconnectTarget: { scope: targetScope },
        }),
      );

      expect(exception.code).toBe(
        ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
      );
    },
  );

  it('tells the member that a USER provider only supports personal connections', () => {
    const exception = catchException(() =>
      assertConnectionScopeAllowedByProviderOrThrow({
        connectionProvider: userProvider,
        scope: 'WORKSPACE',
        reconnectTarget: null,
      }),
    );

    expect(exception.code).toBe(
      ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
    );
    expect(exception.message).toBe(
      'Connection provider "linear" has scope USER and does not accept WORKSPACE connections',
    );
    expect(i18n._(exception.userFriendlyMessage)).toBe(
      'Linear only supports personal connections.',
    );
  });

  it('tells the member that a WORKSPACE provider only supports shared connections', () => {
    const exception = catchException(() =>
      assertConnectionScopeAllowedByProviderOrThrow({
        connectionProvider: workspaceProvider,
        scope: 'USER',
        reconnectTarget: null,
      }),
    );

    expect(exception.code).toBe(
      ConnectionProviderExceptionCode.CONNECTION_SCOPE_NOT_ALLOWED,
    );
    expect(i18n._(exception.userFriendlyMessage)).toBe(
      'Slack only supports connections shared with the workspace.',
    );
  });
});
