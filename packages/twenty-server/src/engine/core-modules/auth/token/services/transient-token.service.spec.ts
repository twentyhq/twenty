import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { TransientTokenService } from './transient-token.service';

describe('TransientTokenService', () => {
  let service: TransientTokenService;
  let jwtWrapperService: JwtWrapperService;
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransientTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            sign: jest.fn(),
            verifyWorkspaceToken: jest.fn(),
            decode: jest.fn(),
            generateAppSecret: jest.fn().mockReturnValue('mocked-secret'),
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

    service = module.get<TransientTokenService>(TransientTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    environmentService = module.get<EnvironmentService>(EnvironmentService);
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

      jest.spyOn(environmentService, 'get').mockImplementation((key) => {
        if (key === 'SHORT_TERM_TOKEN_EXPIRES_IN') return mockExpiresIn;

        return undefined;
      });
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateTransientToken(
        workspaceMemberId,
        userId,
        workspaceId,
      );

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(environmentService.get).toHaveBeenCalledWith(
        'SHORT_TERM_TOKEN_EXPIRES_IN',
      );
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: workspaceMemberId,
          userId,
          workspaceId,
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
      };

      jest
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
        .mockResolvedValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);

      const result = await service.verifyTransientToken(mockToken);

      expect(result).toEqual({
        workspaceMemberId: mockPayload.sub,
        userId: mockPayload.userId,
        workspaceId: mockPayload.workspaceId,
      });
      expect(jwtWrapperService.verifyWorkspaceToken).toHaveBeenCalledWith(
        mockToken,
        'LOGIN',
      );
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken);
    });

    it('should throw an error if token verification fails', async () => {
      const mockToken = 'invalid-token';

      jest
        .spyOn(jwtWrapperService, 'verifyWorkspaceToken')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyTransientToken(mockToken)).rejects.toThrow();
    });
  });
});
