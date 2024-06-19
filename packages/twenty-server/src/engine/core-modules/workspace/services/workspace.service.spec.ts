import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';

import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: BillingService,
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
          provide: OnboardingService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
