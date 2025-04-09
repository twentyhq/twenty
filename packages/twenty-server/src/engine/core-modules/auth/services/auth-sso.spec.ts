import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AuthSsoService } from 'src/engine/core-modules/auth/services/auth-sso.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

describe('AuthSsoService', () => {
  let authSsoService: AuthSsoService;
  let workspaceRepository: Repository<Workspace>;
  let environmentService: EnvironmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSsoService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOne: jest.fn(),
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

    authSsoService = module.get<AuthSsoService>(AuthSsoService);
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    environmentService = module.get<EnvironmentService>(EnvironmentService);
  });

  describe('findWorkspaceFromWorkspaceIdOrAuthProvider', () => {
    it('should return a workspace by workspaceId', async () => {
      const workspaceId = 'workspace-id-123';
      const mockWorkspace = { id: workspaceId } as Workspace;

      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);

      const result =
        await authSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider(
          { authProvider: 'google', email: 'test@example.com' },
          workspaceId,
        );

      expect(result).toEqual(mockWorkspace);
      expect(workspaceRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: workspaceId,
        },
        relations: ['approvedAccessDomains'],
      });
    });

    it('should return a workspace from authProvider and email when multi-workspace mode is enabled', async () => {
      const authProvider = 'google';
      const email = 'test@example.com';
      const mockWorkspace = { id: 'workspace-id-456' } as Workspace;

      jest.spyOn(environmentService, 'get').mockReturnValue(true);
      jest
        .spyOn(workspaceRepository, 'findOne')
        .mockResolvedValue(mockWorkspace);

      const result =
        await authSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider({
          authProvider,
          email,
        });

      expect(result).toEqual(mockWorkspace);
      expect(workspaceRepository.findOne).toHaveBeenCalledWith({
        where: {
          isGoogleAuthEnabled: true,
          workspaceUsers: {
            user: {
              email,
            },
          },
        },
        relations: [
          'workspaceUsers',
          'workspaceUsers.user',
          'approvedAccessDomains',
        ],
      });
    });

    it('should return undefined if no workspace is found when multi-workspace mode is enabled', async () => {
      jest.spyOn(environmentService, 'get').mockReturnValue(true);
      jest.spyOn(workspaceRepository, 'findOne').mockResolvedValue(null);

      const result =
        await authSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider({
          authProvider: 'google',
          email: 'notfound@example.com',
        });

      expect(result).toBeUndefined();
    });

    it('should throw an error for an invalid authProvider', async () => {
      jest.spyOn(environmentService, 'get').mockReturnValue(true);

      await expect(
        authSsoService.findWorkspaceFromWorkspaceIdOrAuthProvider({
          authProvider: 'invalid-provider' as any,
          email: 'test@example.com',
        }),
      ).rejects.toThrow('invalid-provider is not a valid auth provider.');
    });
  });
});
