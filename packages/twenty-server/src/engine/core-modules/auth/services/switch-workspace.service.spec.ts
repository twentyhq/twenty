import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { SSOService } from 'src/engine/core-modules/sso/services/sso.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { SwitchWorkspaceService } from './switch-workspace.service';

describe('SwitchWorkspaceService', () => {
  let service: SwitchWorkspaceService;
  let userRepository: Repository<User>;
  let workspaceRepository: Repository<Workspace>;
  let ssoService: SSOService;
  let accessTokenService: AccessTokenService;
  let refreshTokenService: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwitchWorkspaceService,
        {
          provide: getRepositoryToken(User, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useClass: Repository,
        },
        {
          provide: SSOService,
          useValue: {
            listSSOIdentityProvidersByWorkspaceId: jest.fn(),
          },
        },
        {
          provide: AccessTokenService,
          useValue: {
            generateAccessToken: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            generateRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SwitchWorkspaceService>(SwitchWorkspaceService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User, 'core'),
    );
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    ssoService = module.get<SSOService>(SSOService);
    accessTokenService = module.get<AccessTokenService>(AccessTokenService);
    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('switchWorkspace', () => {
    it('should throw an error if user does not exist', async () => {
      jest.spyOn(userRepository, 'findBy').mockResolvedValue([]);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.switchWorkspace(
          { id: 'non-existent-user' } as User,
          'workspace-id',
        ),
      ).rejects.toThrow(AuthException);
    });

    it('should throw an error if workspace does not exist', async () => {
      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([{ id: 'user-id' } as User]);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.switchWorkspace(
          { id: 'user-id' } as User,
          'non-existent-workspace',
        ),
      ).rejects.toThrow(AuthException);
    });

    it('should throw an error if user does not belong to workspace', async () => {
      const mockUser = { id: 'user-id' };
      const mockWorkspace = {
        id: 'workspace-id',
        workspaceUsers: [{ userId: 'other-user-id' }],
        workspaceSSOIdentityProviders: [],
      };

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([mockUser as User]);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as any);

      await expect(
        service.switchWorkspace(mockUser as User, 'workspace-id'),
      ).rejects.toThrow(AuthException);
    });

    it('should return SSO auth info if workspace has SSO providers', async () => {
      const mockUser = { id: 'user-id' };
      const mockWorkspace = {
        id: 'workspace-id',
        workspaceUsers: [{ userId: 'user-id' }],
        workspaceSSOIdentityProviders: [{}],
      };
      const mockSSOProviders = [{ id: 'sso-provider-id' }];

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([mockUser as User]);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as any);
      jest
        .spyOn(ssoService, 'listSSOIdentityProvidersByWorkspaceId')
        .mockResolvedValue(mockSSOProviders as any);

      const result = await service.switchWorkspace(
        mockUser as User,
        'workspace-id',
      );

      expect(result).toEqual({
        useSSOAuth: true,
        workspace: mockWorkspace,
        availableSSOIdentityProviders: mockSSOProviders,
      });
    });

    it('should return workspace info if workspace does not have SSO providers', async () => {
      const mockUser = { id: 'user-id' };
      const mockWorkspace = {
        id: 'workspace-id',
        workspaceUsers: [{ userId: 'user-id' }],
        workspaceSSOIdentityProviders: [],
      };

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([mockUser as User]);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as any);

      const result = await service.switchWorkspace(
        mockUser as User,
        'workspace-id',
      );

      expect(result).toEqual({
        useSSOAuth: false,
        workspace: mockWorkspace,
      });
    });
  });

  describe('generateSwitchWorkspaceToken', () => {
    it('should generate and return auth tokens', async () => {
      const mockUser = { id: 'user-id' };
      const mockWorkspace = { id: 'workspace-id' };
      const mockAccessToken = { token: 'access-token', expiresAt: new Date() };
      const mockRefreshToken = 'refresh-token';

      jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);
      jest
        .spyOn(accessTokenService, 'generateAccessToken')
        .mockResolvedValue(mockAccessToken);
      jest
        .spyOn(refreshTokenService, 'generateRefreshToken')
        .mockResolvedValue(mockRefreshToken as any);

      const result = await service.generateSwitchWorkspaceToken(
        mockUser as User,
        mockWorkspace as Workspace,
      );

      expect(result).toEqual({
        tokens: {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        id: mockUser.id,
        defaultWorkspace: mockWorkspace,
      });
      expect(accessTokenService.generateAccessToken).toHaveBeenCalledWith(
        mockUser.id,
        mockWorkspace.id,
      );
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockWorkspace.id,
      );
    });
  });
});
