import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Request, type Response } from 'express';

import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { OAuthRegistrationController } from 'src/engine/core-modules/application/application-oauth/controllers/oauth-registration.controller';
import { type OAuthRegisterInput } from 'src/engine/core-modules/application/application-oauth/dtos/oauth-register.input';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

describe('OAuthRegistrationController', () => {
  let controller: OAuthRegistrationController;
  let applicationRegistrationRepository: {
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  const request = {
    ip: '127.0.0.1',
    protocol: 'https',
    get: () => 'api.example.com',
  } as unknown as Request;

  const buildResponse = () =>
    ({ status: jest.fn(), setHeader: jest.fn() }) as unknown as Response;

  const buildBody = (
    overrides: Partial<OAuthRegisterInput> = {},
  ): OAuthRegisterInput => ({
    client_name: 'Codex',
    redirect_uris: ['http://127.0.0.1:60123/callback'],
    ...overrides,
  });

  beforeEach(async () => {
    applicationRegistrationRepository = {
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn(async (entity) => entity),
      create: jest.fn((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthRegistrationController],
      providers: [
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        { provide: HttpExceptionHandlerService, useValue: {} },
        {
          provide: ThrottlerService,
          useValue: { tokenBucketThrottleOrThrow: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(OAuthRegistrationController);
  });

  it('should create a registration when no identical one exists', async () => {
    const result = await controller.register(
      buildBody(),
      request,
      buildResponse(),
    );

    expect(applicationRegistrationRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      client_id:
        applicationRegistrationRepository.save.mock.calls[0][0].oAuthClientId,
    });
  });

  it('should return the existing client_id when an identical public registration exists', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([
      {
        oAuthClientId: 'existing-client-id',
        oAuthRedirectUris: ['http://127.0.0.1:54321/callback'],
        oAuthScopes: [...ALL_OAUTH_SCOPES].reverse(),
      },
    ]);

    const result = await controller.register(
      buildBody(),
      request,
      buildResponse(),
    );

    expect(applicationRegistrationRepository.save).not.toHaveBeenCalled();
    expect(result).toMatchObject({ client_id: 'existing-client-id' });
  });

  it('should not reuse a registration with different redirect URIs or scopes', async () => {
    applicationRegistrationRepository.find.mockResolvedValue([
      {
        oAuthClientId: 'other-redirect',
        oAuthRedirectUris: ['https://evil.example.com/callback'],
        oAuthScopes: [...ALL_OAUTH_SCOPES],
      },
      {
        oAuthClientId: 'other-scopes',
        oAuthRedirectUris: ['http://127.0.0.1:60123/callback'],
        oAuthScopes: [ALL_OAUTH_SCOPES[0]],
      },
    ]);

    const result = await controller.register(
      buildBody(),
      request,
      buildResponse(),
    );

    expect(applicationRegistrationRepository.save).toHaveBeenCalledTimes(1);
    expect(result).not.toMatchObject({ client_id: 'other-redirect' });
    expect(result).not.toMatchObject({ client_id: 'other-scopes' });
  });
});
