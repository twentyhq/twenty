import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
import { User } from 'src/core/user/user.entity';
import { JwtAuthStrategy } from 'src/core/auth/strategies/jwt.auth.strategy';
import { EmailService } from 'src/integrations/email/email.service';

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
          provide: getRepositoryToken(RefreshToken, 'core'),
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
