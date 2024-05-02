import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CanActivate } from '@nestjs/common';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { CaptchaGuard } from 'src/engine/integrations/captcha/captcha.guard';

import { AuthResolver } from './auth.resolver';

import { TokenService } from './services/token.service';
import { AuthService } from './services/auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  const mock_CaptchaGuard: CanActivate = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(CaptchaGuard)
      .useValue(mock_CaptchaGuard)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
