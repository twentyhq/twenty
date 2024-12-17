import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AppToken,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationException } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

import { WorkspaceInvitationService } from './workspace-invitation.service';

// To fix a circular dependency issue
jest.mock('src/engine/core-modules/workspace/services/workspace.service');

describe('WorkspaceInvitationService', () => {
  let service: WorkspaceInvitationService;
  let appTokenRepository: Repository<AppToken>;
  let userWorkspaceRepository: Repository<UserWorkspace>;
  let environmentService: EnvironmentService;
  let emailService: EmailService;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useClass: Repository,
        },
        {
          provide: DomainManagerService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
          },
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingInviteTeamPending: jest.fn(),
          },
        },
        {
          provide: WorkspaceService,
          useValue: {
            // Mock methods you expect WorkspaceInvitationService to call
            getDefaultWorkspace: jest
              .fn()
              .mockResolvedValue({ id: 'default-workspace-id' }),
            // Add other methods as needed
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    appTokenRepository = module.get<Repository<AppToken>>(
      getRepositoryToken(AppToken, 'core'),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspace>>(
      getRepositoryToken(UserWorkspace, 'core'),
    );
    environmentService = module.get<EnvironmentService>(EnvironmentService);
    emailService = module.get<EmailService>(EmailService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspaceInvitation', () => {
    it('should create a workspace invitation successfully', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as Workspace;

      jest.spyOn(appTokenRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);

      jest.spyOn(userWorkspaceRepository, 'exists').mockResolvedValue(false);
      jest
        .spyOn(service, 'generateInvitationToken')
        .mockResolvedValue({} as AppToken);

      await expect(
        service.createWorkspaceInvitation(email, workspace),
      ).resolves.not.toThrow();
    });

    it('should throw an exception if invitation already exists', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as Workspace;

      jest.spyOn(appTokenRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({}),
      } as any);

      await expect(
        service.createWorkspaceInvitation(email, workspace),
      ).rejects.toThrow(WorkspaceInvitationException);
    });
  });

  describe('sendInvitations', () => {
    it('should send invitations successfully', async () => {
      const emails = ['test1@example.com', 'test2@example.com'];
      const workspace = {
        id: 'workspace-id',
        inviteHash: 'invite-hash',
        displayName: 'Test Workspace',
      } as Workspace;
      const sender = { email: 'sender@example.com', firstName: 'Sender' };

      jest.spyOn(service, 'createWorkspaceInvitation').mockResolvedValue({
        context: { email: 'test@example.com' },
        value: 'token-value',
        type: AppTokenType.InvitationToken,
      } as AppToken);
      jest
        .spyOn(environmentService, 'get')
        .mockReturnValue('http://localhost:3000');
      jest.spyOn(emailService, 'send').mockResolvedValue({} as any);
      jest
        .spyOn(onboardingService, 'setOnboardingInviteTeamPending')
        .mockResolvedValue({} as any);

      const result = await service.sendInvitations(
        emails,
        workspace,
        sender as User,
      );

      expect(result.success).toBe(true);
      expect(result.result.length).toBe(2);
      expect(emailService.send).toHaveBeenCalledTimes(2);
      expect(
        onboardingService.setOnboardingInviteTeamPending,
      ).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        value: false,
      });
    });
  });
});
