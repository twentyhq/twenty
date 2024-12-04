import { Test, TestingModule } from '@nestjs/testing';

import { ErrorHandlerService } from 'src/engine/core-modules/auth/auth-exception-handler.service';
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
        {
          provide: ErrorHandlerService,
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
