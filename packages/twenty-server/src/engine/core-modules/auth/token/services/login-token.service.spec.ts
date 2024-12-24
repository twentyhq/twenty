import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { LoginTokenService } from './login-token.service';

describe('LoginTokenService', () => {
  let service: LoginTokenService;
  let jwtWrapperService: JwtWrapperService;
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            generateAppSecret: jest.fn(),
            sign: jest.fn(),
            verifyWorkspaceToken: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoginTokenService>(LoginTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
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
      jest.spyOn(environmentService, 'get').mockReturnValue(mockExpiresIn);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateLoginToken(email, workspaceId);

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        'LOGIN',
        workspaceId,
      );
      expect(environmentService.get).toHaveBeenCalledWith(
        'LOGIN_TOKEN_EXPIRES_IN',
      );
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        { sub: email, workspaceId },
        { secret: mockSecret, expiresIn: mockExpiresIn },
      );
    });
  });

  describe('verifyLoginToken', () => {
    it('should verify a login token successfully', async () => {
      const mockToken = 'valid-token';
      const mockEmail = 'test@example.com';

      jest
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
        .mockResolvedValue(undefined);
      jest
        .spyOn(jwtWrapperService, 'decode')
        .mockReturnValue({ sub: mockEmail });

      const result = await service.verifyLoginToken(mockToken);

      expect(result).toEqual({ sub: mockEmail });
      expect(jwtWrapperService.verifyWorkspaceToken).toHaveBeenCalledWith(
        mockToken,
        'LOGIN',
      );
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken, {
        json: true,
      });
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyLoginToken(mockToken)).rejects.toThrow();
    });
  });
});
