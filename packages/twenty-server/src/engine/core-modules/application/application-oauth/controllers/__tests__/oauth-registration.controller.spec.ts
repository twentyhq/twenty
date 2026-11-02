import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Request, type Response } from 'express';

import { ApplicationOAuthIdentityService } from 'src/engine/core-modules/application/application-oauth-identity/services/application-oauth-identity.service';
import { OAuthRegistrationController } from 'src/engine/core-modules/application/application-oauth/controllers/oauth-registration.controller';
import { type OAuthRegisterInput } from 'src/engine/core-modules/application/application-oauth/dtos/oauth-register.input';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('OAuthRegistrationController', () => {
  let controller: OAuthRegistrationController;
  let isDynamicClientRegistrationEnabled: boolean;
  let applicationRegistrationRepository: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let findRegistrationByRedirectUris: jest.Mock;
  let tokenBucketThrottleOrThrow: jest.Mock;

  const request = {
    ip: '127.0.0.1',
    protocol: 'https',
    get: () => 'crm.example.com',
  } as unknown as Request;

  const buildResponse = () =>
    ({ status: jest.fn(), setHeader: jest.fn() }) as unknown as Response & {
      status: jest.Mock;
    };

  const buildBody = (redirectUris: string[]): OAuthRegisterInput => ({
    client_name: 'Claude',
    redirect_uris: redirectUris,
  });

  beforeEach(async () => {
    isDynamicClientRegistrationEnabled = true;
    applicationRegistrationRepository = {
      create: jest.fn((registration) => registration),
      save: jest.fn(async (registration) => ({
        ...registration,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      })),
    };
    tokenBucketThrottleOrThrow = jest.fn();
    findRegistrationByRedirectUris = jest.fn(async (redirectUris: string[]) =>
      redirectUris.every(
        (redirectUri) =>
          redirectUri === 'https://claude.ai/api/mcp/auth_callback',
      )
        ? {
            oAuthClientId: 'claude-app-client-id',
            name: 'Claude',
            oAuthScopes: ['api', 'profile'],
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          }
        : null,
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthRegistrationController],
      providers: [
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: ThrottlerService,
          useValue: { tokenBucketThrottleOrThrow },
        },
        {
          provide: ApplicationOAuthIdentityService,
          useValue: { findRegistrationByRedirectUris },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: () => isDynamicClientRegistrationEnabled },
        },
        { provide: HttpExceptionHandlerService, useValue: {} },
      ],
    }).compile();

    controller = module.get(OAuthRegistrationController);
  });

  it("answers a client whose callbacks are an app's OAuth identity with that app's registration", async () => {
    const response = await controller.register(
      buildBody(['https://claude.ai/api/mcp/auth_callback']),
      request,
      buildResponse(),
    );

    expect(response).toMatchObject({
      client_id: 'claude-app-client-id',
      client_name: 'Claude',
      redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
    });
    expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
  });

  it('registers a new client for any other callback', async () => {
    const response = await controller.register(
      buildBody(['https://example.com/callback']),
      request,
      buildResponse(),
    );

    expect(applicationRegistrationRepository.save).toHaveBeenCalledTimes(1);
    expect(response).toMatchObject({ client_name: 'Claude' });
    expect(response).not.toMatchObject({
      client_id: 'claude-app-client-id',
    });
  });

  it('only rate limits registrations that create a client', async () => {
    tokenBucketThrottleOrThrow.mockRejectedValue(
      new ThrottlerException(
        'Limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      ),
    );

    await expect(
      controller.register(
        buildBody(['https://claude.ai/api/mcp/auth_callback']),
        request,
        buildResponse(),
      ),
    ).resolves.toMatchObject({ client_id: 'claude-app-client-id' });

    const response = buildResponse();

    await expect(
      controller.register(
        buildBody(['https://example.com/callback']),
        request,
        response,
      ),
    ).resolves.toMatchObject({ error: 'rate_limit_exceeded' });
    expect(response.status).toHaveBeenCalledWith(429);
  });

  it('refuses to register once dynamic client registration is off', async () => {
    isDynamicClientRegistrationEnabled = false;

    const response = buildResponse();

    await expect(
      controller.register(
        buildBody(['https://claude.ai/api/mcp/auth_callback']),
        request,
        response,
      ),
    ).resolves.toMatchObject({ error: 'not_found' });
    expect(response.status).toHaveBeenCalledWith(404);
    expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
  });
});
