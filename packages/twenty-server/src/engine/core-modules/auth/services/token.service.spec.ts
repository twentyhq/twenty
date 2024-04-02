import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { JwtAuthStrategy } from 'src/engine/core-modules/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/engine/integrations/email/email.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: JwtAuthStrategy,
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
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
