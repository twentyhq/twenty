import { Test, type TestingModule } from '@nestjs/testing';
import { type Request } from 'express';

import { GoogleStrategy } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { MicrosoftStrategy } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

describe('OAuth Strategies', () => {
  let googleStrategy: GoogleStrategy;
  let microsoftStrategy: MicrosoftStrategy;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        MicrosoftStrategy,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AUTH_GOOGLE_CLIENT_ID') return 'google-client-id';
              if (key === 'AUTH_GOOGLE_CLIENT_SECRET')
                return 'google-client-secret';
              if (key === 'AUTH_GOOGLE_CALLBACK_URL')
                return 'http://localhost:3000/auth/google/redirect';
              if (key === 'AUTH_MICROSOFT_CLIENT_ID') return 'ms-client-id';
              if (key === 'AUTH_MICROSOFT_CLIENT_SECRET')
                return 'ms-client-secret';
              if (key === 'AUTH_MICROSOFT_CALLBACK_URL')
                return 'http://localhost:3000/auth/microsoft/redirect';
              return null;
            }),
          },
        },
      ],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    microsoftStrategy = module.get<MicrosoftStrategy>(MicrosoftStrategy);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('marks OAuth callback URLs as isEnvOnly', () => {
    expect(isEnvOnlyConfigVar('AUTH_GOOGLE_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_GOOGLE_APIS_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_MICROSOFT_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_MICROSOFT_APIS_CALLBACK_URL')).toBe(true);
  });

  it('dynamically injects current AUTH_GOOGLE_CALLBACK_URL when GoogleStrategy.authenticate is called', () => {
    const mockReq = {
      query: {},
      params: {},
    } as unknown as Request;

    const superAuthenticateSpy = jest
      .spyOn(Object.getPrototypeOf(GoogleStrategy.prototype), 'authenticate')
      .mockImplementation(() => {});

    jest
      .spyOn(twentyConfigService, 'get')
      .mockReturnValue('https://custom-domain.com/auth/google/redirect');

    googleStrategy.authenticate(mockReq, {});

    expect(superAuthenticateSpy).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        callbackURL: 'https://custom-domain.com/auth/google/redirect',
      }),
    );
  });

  it('dynamically injects current AUTH_MICROSOFT_CALLBACK_URL when MicrosoftStrategy.authenticate is called', () => {
    const mockReq = {
      query: {},
      params: {},
    } as unknown as Request;

    const superAuthenticateSpy = jest
      .spyOn(Object.getPrototypeOf(MicrosoftStrategy.prototype), 'authenticate')
      .mockImplementation(() => {});

    jest
      .spyOn(twentyConfigService, 'get')
      .mockReturnValue('https://custom-domain.com/auth/microsoft/redirect');

    microsoftStrategy.authenticate(mockReq, {});

    expect(superAuthenticateSpy).toHaveBeenCalledWith(
      mockReq,
      expect.objectContaining({
        callbackURL: 'https://custom-domain.com/auth/microsoft/redirect',
      }),
    );
  });
});
