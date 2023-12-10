import { Test, TestingModule } from '@nestjs/testing';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { ClientConfigResolver } from './client-config.resolver';

describe('ClientConfigResolver', () => {
  let resolver: ClientConfigResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientConfigResolver,
        {
          provide: EnvironmentService,
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
