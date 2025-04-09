import { Test, TestingModule } from '@nestjs/testing';

import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ClientConfigResolver } from './client-config.resolver';

describe('ClientConfigResolver', () => {
  let resolver: ClientConfigResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigResolver,
        {
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: DomainManagerService,
          useValue: {},
        },
      ],
    }).compile();

    resolver = module.get<ClientConfigResolver>(ClientConfigResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
