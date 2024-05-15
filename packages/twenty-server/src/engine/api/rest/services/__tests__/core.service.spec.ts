import { Test, TestingModule } from '@nestjs/testing';

import { CoreService } from 'src/engine/api/rest/services/core.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core-query-builder/core-query-builder.factory';
import { RestApiService } from 'src/engine/api/rest/services/rest-api.service';

describe('CoreService', () => {
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
          provide: RestApiService,
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
