import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenService } from 'src/engine/core-modules/app-token/services/app-token.service';
import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';

describe('AppTokenService', () => {
  let service: AppTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppTokenService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AppTokenService>(AppTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
