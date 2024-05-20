import { Test, TestingModule } from '@nestjs/testing';

import { RestApiCoreService } from 'src/engine/api/rest/services/rest-api-core.service';
import { CoreQueryBuilderFactory } from 'src/engine/api/rest/rest-api-core-query-builder/core-query-builder.factory';
import { RestApiService } from 'src/engine/api/rest/services/rest-api.service';

describe('RestApiCoreService', () => {
  let service: RestApiCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestApiCoreService,
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

    service = module.get<RestApiCoreService>(RestApiCoreService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
