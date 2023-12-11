import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from 'src/core/auth/services/auth.service';
import { TokenService } from 'src/core/auth/services/token.service';

import { VerifyAuthController } from './verify-auth.controller';

describe('VerifyAuthController', () => {
  let controller: VerifyAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VerifyAuthController>(VerifyAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
