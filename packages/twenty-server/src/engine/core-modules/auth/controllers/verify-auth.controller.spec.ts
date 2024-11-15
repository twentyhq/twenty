import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';

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
          provide: LoginTokenService,
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
