import { Test, type TestingModule } from '@nestjs/testing';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';

import { TransientTokenService } from './transient-token.service';

describe('TransientTokenService', () => {
  let service: TransientTokenService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransientTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            sign: jest.fn(),
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
            generateAppSecret: jest.fn().mockReturnValue('mocked-secret'),
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

    service = module.get<TransientTokenService>(TransientTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTransientToken', () => {
    it('should generate a transient token successfully', async () => {
      const workspaceMemberId = 'workspace-member-id';
      const userId = 'user-id';
      const workspaceId = 'workspace-id';
      const mockExpiresIn = '15m';
      const mockToken = 'mock-token';

      jest.spyOn(twentyConfigService, 'get').mockImplementation((key) => {
        if (key === 'SHORT_TERM_TOKEN_EXPIRES_IN') return mockExpiresIn;

        return undefined;
      });
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateTransientToken({
        workspaceMemberId,
        userId,
        workspaceId,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(twentyConfigService.get).toHaveBeenCalledWith(
        'SHORT_TERM_TOKEN_EXPIRES_IN',
      );
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: workspaceMemberId,
          type: JwtTokenTypeEnum.LOGIN,
          userId,
          workspaceId,
          workspaceMemberId,
        },
        expect.objectContaining({
          secret: 'mocked-secret',
          expiresIn: mockExpiresIn,
        }),
      );
    });
  });

  describe('verifyTransientToken', () => {
    it('should verify a transient token successfully', async () => {
      const mockToken = 'valid-token';
      const mockPayload = {
        sub: 'workspace-member-id',
        userId: 'user-id',
        workspaceId: 'workspace-id',
        workspaceMemberId: 'workspace-member-id',
      };

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);

      const result = await service.verifyTransientToken(mockToken);

      expect(result).toEqual({
        workspaceMemberId: mockPayload.workspaceMemberId,
        sub: mockPayload.sub,
        userId: mockPayload.userId,
        workspaceId: mockPayload.workspaceId,
      });
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyTransientToken(mockToken)).rejects.toThrow();
    });
  });
});
