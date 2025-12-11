import { Test, type TestingModule } from '@nestjs/testing';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

import { LoginTokenService } from './login-token.service';

describe('LoginTokenService', () => {
  let service: LoginTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            generateAppSecret: jest.fn(),
            sign: jest.fn(),
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoginTokenService>(LoginTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateLoginToken', () => {
    it('should generate a login token successfully', async () => {
      const email = 'test@example.com';
      const mockSecret = 'mock-secret';
      const mockExpiresIn = '1h';
      const mockToken = 'mock-token';
      const workspaceId = 'workspace-id';

      jest
        .spyOn(jwtWrapperService, 'generateAppSecret')
        .mockReturnValue(mockSecret);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(mockExpiresIn);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateLoginToken(
        email,
        workspaceId,
        AuthProviderEnum.Password,
      );

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.LOGIN,
        workspaceId,
      );
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'LOGIN_TOKEN_EXPIRES_IN',
      );
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: email,
          workspaceId,
          type: JwtTokenTypeEnum.LOGIN,
          authProvider: AuthProviderEnum.Password,
          impersonatorUserId: undefined,
        },
        { secret: mockSecret, expiresIn: mockExpiresIn },
      );
    });
  });

  describe('generateLoginToken with impersonation', () => {
    it('should include impersonatorUserId in JWT payload when using Impersonation auth provider', async () => {
      const email = 'test@example.com';
      const mockSecret = 'mock-secret';
      const mockToken = 'mock-token';
      const workspaceId = 'workspace-id';
      const impersonatorUserWorkspaceId = 'impersonator-id';

      jest
        .spyOn(jwtWrapperService, 'generateAppSecret')
        .mockReturnValue(mockSecret);
      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateLoginToken(
        email,
        workspaceId,
        AuthProviderEnum.Impersonation,
        { impersonatorUserWorkspaceId },
      );

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.LOGIN,
        workspaceId,
      );
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: email,
          workspaceId,
          type: JwtTokenTypeEnum.LOGIN,
          authProvider: AuthProviderEnum.Impersonation,
          impersonatorUserWorkspaceId,
        },
        { secret: mockSecret, expiresIn: expect.any(String) },
      );
    });
  });

  describe('verifyLoginToken', () => {
    it('should verify a login token successfully', async () => {
      const mockToken = 'valid-token';
      const mockEmail = 'test@example.com';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(jwtWrapperService, 'decode')
        .mockReturnValue({ sub: mockEmail });

      const result = await service.verifyLoginToken(mockToken);

      expect(result).toEqual({ sub: mockEmail });
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken, {
        json: true,
      });
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyLoginToken(mockToken)).rejects.toThrow();
    });
  });
});
