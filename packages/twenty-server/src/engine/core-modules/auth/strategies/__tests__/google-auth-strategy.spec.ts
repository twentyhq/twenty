import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';

import { GoogleStrategy } from 'src/engine/core-modules/auth/strategies/google.auth.strategy';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { isEnvOnlyConfigVar } from 'src/engine/core-modules/twenty-config/utils/is-env-only-config-var.util';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'AUTH_GOOGLE_CLIENT_ID') return 'client-id';
              if (key === 'AUTH_GOOGLE_CLIENT_SECRET') return 'client-secret';
              if (key === 'AUTH_GOOGLE_CALLBACK_URL')
                return 'http://localhost:3000/auth/google/redirect';
              return null;
            }),
          },
        },
      ],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('should be defined', () => {
    expect(googleStrategy).toBeDefined();
  });

  it('should mark AUTH_GOOGLE_CALLBACK_URL as isEnvOnly', () => {
    expect(isEnvOnlyConfigVar('AUTH_GOOGLE_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_GOOGLE_APIS_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_MICROSOFT_CALLBACK_URL')).toBe(true);
    expect(isEnvOnlyConfigVar('AUTH_MICROSOFT_APIS_CALLBACK_URL')).toBe(true);
  });

  it('should dynamically inject current AUTH_GOOGLE_CALLBACK_URL when authenticate is called', () => {
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
});
