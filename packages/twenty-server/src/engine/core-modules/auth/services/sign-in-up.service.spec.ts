import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';

describe('SignInUpService', () => {
  let service: SignInUpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: FileUploadService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: OnboardingService,
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SignInUpService>(SignInUpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
