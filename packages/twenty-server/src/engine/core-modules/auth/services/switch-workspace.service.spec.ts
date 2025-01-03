import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { SwitchWorkspaceService } from './switch-workspace.service';

describe('SwitchWorkspaceService', () => {
  let service: SwitchWorkspaceService;
  let userRepository: Repository<User>;
  let workspaceRepository: Repository<Workspace>;

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
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
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
        logo: 'logo',
        displayName: 'displayName',
        isGoogleAuthEnabled: true,
        isPasswordAuthEnabled: true,
        isMicrosoftAuthEnabled: false,
        workspaceSSOIdentityProviders: [
          {
            id: 'sso-id',
          },
        ],
      };

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([mockUser as User]);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as User);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as any);

      const result = await service.switchWorkspace(
        mockUser as User,
        'workspace-id',
      );

      expect(result).toEqual({
        id: mockWorkspace.id,
        logo: expect.any(String),
        displayName: expect.any(String),
        authProviders: expect.any(Object),
      });
    });

    it('should return workspace info if workspace does not have SSO providers', async () => {
      const mockUser = { id: 'user-id' };
      const mockWorkspace = {
        id: 'workspace-id',
        workspaceUsers: [{ userId: 'user-id' }],
        workspaceSSOIdentityProviders: [],
        logo: 'logo',
        displayName: 'displayName',
      };

      jest
        .spyOn(userRepository, 'findBy')
        .mockResolvedValue([mockUser as User]);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);

      const result = await service.switchWorkspace(
        mockUser as User,
        'workspace-id',
      );

      expect(result).toEqual({
        id: mockWorkspace.id,
        logo: expect.any(String),
        displayName: expect.any(String),
        authProviders: expect.any(Object),
      });
    });
  });
});
