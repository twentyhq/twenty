import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceException } from 'src/engine/core-modules/workspace/workspace.exception';

describe('ApplicationTokenService', () => {
  let service: ApplicationTokenService;
  let jwtWrapperService: JwtWrapperService;
  let workspaceRepository: Repository<WorkspaceEntity>;
  let applicationRepository: Repository<ApplicationEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTokenService,
        {
          provide: JwtWrapperService,
          useValue: {
            sign: jest.fn(),
            verifyJwtToken: jest.fn(),
            decode: jest.fn(),
            generateAppSecret: jest.fn(),
            extractJwtFromRequest: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ApplicationTokenService>(ApplicationTokenService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    applicationRepository = module.get<Repository<ApplicationEntity>>(
      getRepositoryToken(ApplicationEntity),
    );
    workspaceRepository = module.get<Repository<WorkspaceEntity>>(
      getRepositoryToken(WorkspaceEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApplicationAccessToken', () => {
    it('should generate an application access token successfully', async () => {
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const mockWorkspace = { id: workspaceId };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateApplicationAccessToken({
        workspaceId,
        applicationId,
        expiresInSeconds: 10,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: applicationId,
          applicationId,
        }),
        expect.any(Object),
      );
    });

    it('should include optional userWorkspaceId and userId in payload', async () => {
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const userWorkspaceId = 'user-workspace-id';
      const userId = 'user-id';
      const mockWorkspace = { id: workspaceId };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateApplicationAccessToken({
        workspaceId,
        applicationId,
        userWorkspaceId,
        userId,
        expiresInSeconds: 10,
      });

      expect(result).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: applicationId,
          applicationId,
          workspaceId,
          userWorkspaceId,
          userId,
        }),
        expect.any(Object),
      );
    });
  });

  it('should throw an error if application is not found', async () => {
    const workspaceId = 'workspace-id';

    const mockWorkspace = { id: workspaceId };

    jest.spyOn(applicationRepository, 'findOne').mockResolvedValue(null);
    jest
      .spyOn(workspaceRepository, 'findOne')
      .mockResolvedValue(mockWorkspace as WorkspaceEntity);

    await expect(
      service.generateApplicationAccessToken({
        applicationId: 'non-existent-application',
        workspaceId: 'workspace-id',
        expiresInSeconds: 10,
      }),
    ).rejects.toThrow(ApplicationException);
  });

  it('should throw an error if workspace is not found', async () => {
    jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

    await expect(
      service.generateApplicationAccessToken({
        applicationId: 'application-id',
        workspaceId: 'non-existent-workspace',
        expiresInSeconds: 10,
      }),
    ).rejects.toThrow(WorkspaceException);
  });

  describe('validateApplicationRefreshToken', () => {
    it('should validate and return payload for a valid refresh token', () => {
      const mockToken = 'valid-refresh-token';
      const mockPayload = {
        sub: 'application-id',
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
        type: JwtTokenTypeEnum.APPLICATION_REFRESH,
      };

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockReturnValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue(mockPayload);

      const result = service.validateApplicationRefreshToken(mockToken);

      expect(result).toEqual(mockPayload);
      expect(jwtWrapperService.verifyJwtToken).toHaveBeenCalledWith(mockToken);
      expect(jwtWrapperService.decode).toHaveBeenCalledWith(mockToken, {
        json: true,
      });
    });

    it('should throw when token type is not APPLICATION_REFRESH', () => {
      const mockToken = 'access-token';

      jest
        .spyOn(jwtWrapperService, 'verifyJwtToken')
        .mockReturnValue(undefined);
      jest.spyOn(jwtWrapperService, 'decode').mockReturnValue({
        sub: 'application-id',
        applicationId: 'application-id',
        workspaceId: 'workspace-id',
        type: JwtTokenTypeEnum.APPLICATION_ACCESS,
      });

      expect(() => service.validateApplicationRefreshToken(mockToken)).toThrow(
        AuthException,
      );
    });

    it('should throw when token verification fails', () => {
      const mockToken = 'invalid-token';

      jest.spyOn(jwtWrapperService, 'verifyJwtToken').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() =>
        service.validateApplicationRefreshToken(mockToken),
      ).toThrow();
    });
  });

  describe('generateApplicationTokenPair', () => {
    it('should generate both access and refresh tokens', async () => {
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const mockWorkspace = { id: workspaceId };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.generateApplicationTokenPair({
        workspaceId,
        applicationId,
      });

      expect(result.applicationAccessToken).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(result.applicationRefreshToken).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(jwtWrapperService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('renewApplicationTokens', () => {
    it('should generate a new token pair from validated payload', async () => {
      const workspaceId = 'workspace-id';
      const applicationId = 'application-id';
      const mockWorkspace = { id: workspaceId };
      const mockApplication = { id: applicationId };
      const mockToken = 'mock-token';

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as WorkspaceEntity);
      jest
        .spyOn(applicationRepository, 'findOne')
        .mockResolvedValue(mockApplication as ApplicationEntity);
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);

      const result = await service.renewApplicationTokens({
        workspaceId,
        applicationId,
      });

      expect(result.applicationAccessToken).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
      expect(result.applicationRefreshToken).toEqual({
        token: mockToken,
        expiresAt: expect.any(Date),
      });
    });
  });
});
