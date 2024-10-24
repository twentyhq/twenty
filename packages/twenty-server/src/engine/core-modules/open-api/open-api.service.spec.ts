import { Test, TestingModule } from '@nestjs/testing';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

describe('OpenApiService', () => {
  let service: OpenApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenApiService,
        {
          provide: AccessTokenService,
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
