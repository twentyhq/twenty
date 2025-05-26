import { Test, TestingModule } from '@nestjs/testing';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';

import { ClientConfigResolver } from './client-config.resolver';

describe('ClientConfigResolver', () => {
  let resolver: ClientConfigResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigResolver,
        {
          provide: ClientConfigService,
          useValue: {
            getClientConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<ClientConfigResolver>(ClientConfigResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
