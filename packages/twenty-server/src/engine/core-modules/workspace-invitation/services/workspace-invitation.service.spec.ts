import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';

import { WorkspaceInvitationService } from './workspace-invitation.service';

describe('WorkspaceInvitationService', () => {
  let service: WorkspaceInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceInvitationService,
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: OnboardingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceInvitationService>(
      WorkspaceInvitationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
