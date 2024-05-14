import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';

import { CoreService } from 'src/engine/api/rest/services/core.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core-query-builder/core-query-builder.factory';

describe('ApiRestService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        {
          provide: CoreQueryBuilderFactory,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CoreService>(CoreService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
