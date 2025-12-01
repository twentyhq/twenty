import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceInvitationException } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.exception';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

import { WorkspaceInvitationService } from './workspace-invitation.service';

// To fix a circular dependency issue
jest.mock('src/engine/core-modules/workspace/services/workspace.service');

// To avoid dynamic import issues in Jest
jest.mock('@react-email/render', () => ({
  render: jest.fn().mockImplementation(async (template, options) => {
    if (options?.plainText) {
      return 'Plain Text Email';
    }

    return '<html><body>HTML email content</body></html>';
  }),
}));

describe('WorkspaceInvitationService', () => {
  let service: WorkspaceInvitationService;
  let appTokenRepository: Repository<AppTokenEntity>;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let twentyConfigService: TwentyConfigService;
  let emailService: EmailService;
  let onboardingService: OnboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useClass: Repository,
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            buildWorkspaceURL: jest
              .fn()
              .mockResolvedValue(new URL('http://localhost:3001')),
          },
        },
        {
          provide: TwentyConfigService,
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
            setOnboardingBookOnboardingPending: jest.fn(),
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
        {
          provide: I18nService,
          useValue: {
            getI18nInstance: jest.fn().mockReturnValue({
              _: jest.fn().mockReturnValue('mocked-translation'),
            }),
          },
        },
        {
          provide: FileService,
          useValue: {
            signFileUrl: jest
              .fn()
              .mockReturnValue('https://signed-url.com/logo.png'),
          },
        },
        {
          provide: ThrottlerService,
          useValue: {
            tokenBucketThrottleOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
    appTokenRepository = module.get<Repository<AppTokenEntity>>(
      getRepositoryToken(AppTokenEntity),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
    emailService = module.get<EmailService>(EmailService);
    onboardingService = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspaceInvitation', () => {
    it('should create a workspace invitation successfully', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as WorkspaceEntity;

      jest.spyOn(appTokenRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);

      jest.spyOn(userWorkspaceRepository, 'exists').mockResolvedValue(false);
      jest
        .spyOn(service, 'generateInvitationToken')
        .mockResolvedValue({} as AppTokenEntity);

      await expect(
        service.createWorkspaceInvitation(email, workspace),
      ).resolves.not.toThrow();
    });

    it('should throw an exception if invitation already exists', async () => {
      const email = 'test@example.com';
      const workspace = { id: 'workspace-id' } as WorkspaceEntity;

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
      } as WorkspaceEntity;
      const sender = {
        userEmail: 'sender@example.com',
        name: { firstName: 'Sender' },
        locale: 'en',
      };

      jest.spyOn(service, 'createWorkspaceInvitation').mockResolvedValue({
        context: { email: 'test@example.com' },
        value: 'token-value',
        type: AppTokenType.InvitationToken,
      } as AppTokenEntity);
      jest
        .spyOn(twentyConfigService, 'get')
        .mockReturnValue('http://localhost:3000');
      jest.spyOn(emailService, 'send').mockResolvedValue({} as any);
      jest
        .spyOn(onboardingService, 'setOnboardingInviteTeamPending')
        .mockResolvedValue({} as any);

      const result = await service.sendInvitations(
        emails,
        workspace,
        sender as WorkspaceMemberWorkspaceEntity,
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
      expect(
        onboardingService.setOnboardingBookOnboardingPending,
      ).toHaveBeenCalledWith({
        workspaceId: workspace.id,
        value: true,
      });
    });
  });
});
