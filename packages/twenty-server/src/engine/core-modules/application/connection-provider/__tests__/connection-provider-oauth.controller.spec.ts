import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';
import { type Response } from 'express';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderOAuthFlowService } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth-flow.service';
import { ConnectionProviderOAuthController } from 'src/engine/core-modules/application/connection-provider/connection-provider-oauth.controller';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { TransientTokenService } from 'src/engine/core-modules/auth/token/services/transient-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('ConnectionProviderOAuthController callback', () => {
  let controller: ConnectionProviderOAuthController;
  const getCallbackWorkspaceId = jest.fn();
  const completeAuthorizationFlow = jest.fn();
  const findWorkspace = jest.fn();
  const redirect = jest.fn();
  const response = { redirect } as unknown as Response;
  const workspace = {
    id: 'workspace-id',
    subdomain: 'customer',
    customDomain: null,
  };
  const callbackResult = {
    workspaceId: workspace.id,
    applicationId: 'application-id',
    connectedAccountId: 'connection-id',
    redirectLocation:
      '/settings/applications/application-id?tab=account#general',
    wasReused: true,
  };

  beforeAll(async () => {
    i18n.setMessagesCompiler(compileMessage);
    i18n.load('en', {});
    i18n.activate('en');

    const module = await Test.createTestingModule({
      controllers: [ConnectionProviderOAuthController],
      providers: [
        { provide: ConnectionProviderService, useValue: {} },
        {
          provide: ConnectionProviderOAuthFlowService,
          useValue: { getCallbackWorkspaceId, completeAuthorizationFlow },
        },
        { provide: TransientTokenService, useValue: {} },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: ({
              pathname,
              searchParams,
              hash,
            }: {
              pathname: string;
              searchParams: Record<string, string>;
              hash: string;
            }) => {
              const url = new URL(pathname, 'https://customer.example.com');
              url.search = new URLSearchParams(searchParams).toString();
              url.hash = hash;
              return url;
            },
          },
        },
        {
          provide: GuardRedirectService,
          useValue: {
            getRedirectErrorUrlAndCaptureExceptions: ({
              error,
              workspace: errorWorkspace,
            }: {
              error: Error;
              workspace: { subdomain: string };
            }) => {
              const url = new URL(
                `https://${errorWorkspace.subdomain}.example.com/settings/accounts`,
              );
              url.searchParams.set('errorMessage', error.message);
              return url.toString();
            },
          },
        },
        { provide: TwentyConfigService, useValue: { get: () => 'default' } },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOneBy: findWorkspace },
        },
        { provide: getRepositoryToken(UserWorkspaceEntity), useValue: {} },
      ],
    }).compile();

    controller = module.get(ConnectionProviderOAuthController);
  });

  beforeEach(() => {
    jest.resetAllMocks();
    getCallbackWorkspaceId.mockResolvedValue(workspace.id);
    findWorkspace.mockResolvedValue(workspace);
    completeAuthorizationFlow.mockResolvedValue(callbackResult);
  });

  it('returns a reused connection to the requested page, preserving its tab and parameters', async () => {
    await controller.callback(
      'code',
      'signed-state',
      undefined,
      undefined,
      response,
    );

    const url = new URL(redirect.mock.calls[0][0]);
    expect(url.host).toBe('customer.example.com');
    expect(url.pathname).toBe('/settings/applications/application-id');
    expect(url.hash).toBe('#general');
    expect(url.searchParams.get('tab')).toBe('account');
    expect(url.searchParams.get('appConnectionReused')).toBe('true');
  });

  it('does not report reuse for a new connection, even if the return URL contains the flag', async () => {
    completeAuthorizationFlow.mockResolvedValue({
      ...callbackResult,
      wasReused: false,
      redirectLocation:
        '/settings/applications/application-id?appConnectionReused=true',
    });

    await controller.callback(
      'code',
      'signed-state',
      undefined,
      undefined,
      response,
    );

    expect(
      new URL(redirect.mock.calls[0][0]).searchParams.has(
        'appConnectionReused',
      ),
    ).toBe(false);
  });

  it('shows a readable identity error in the initiating workspace', async () => {
    completeAuthorizationFlow.mockRejectedValue(
      new ConnectionProviderException(
        'Internal identity mismatch for provider-id',
        ConnectionProviderExceptionCode.RECONNECT_ACCOUNT_MISMATCH,
      ),
    );

    await controller.callback(
      'code',
      'signed-state',
      undefined,
      undefined,
      response,
    );

    const url = new URL(redirect.mock.calls[0][0]);
    expect(url.host).toBe('customer.example.com');
    expect(url.searchParams.get('errorMessage')).toContain('different account');
    expect(url.searchParams.get('errorMessage')).not.toContain('provider-id');
  });

  it('does not use workspace information from an invalid state', async () => {
    getCallbackWorkspaceId.mockRejectedValue(
      new ConnectionProviderException(
        'Invalid state',
        ConnectionProviderExceptionCode.INVALID_STATE,
      ),
    );

    await controller.callback(
      'code',
      'invalid-state',
      undefined,
      undefined,
      response,
    );

    expect(findWorkspace).not.toHaveBeenCalled();
    expect(completeAuthorizationFlow).not.toHaveBeenCalled();
    expect(new URL(redirect.mock.calls[0][0]).host).toBe('default.example.com');
  });
});
