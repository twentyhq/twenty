import { Test, TestingModule } from '@nestjs/testing';

import { OpenApiService } from 'src/core/open-api/open-api.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

describe('OpenApiService', () => {
  let service: OpenApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenApiService,
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OpenApiService>(OpenApiService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
