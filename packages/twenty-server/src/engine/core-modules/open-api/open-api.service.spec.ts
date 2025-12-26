import { Test, type TestingModule } from '@nestjs/testing';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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
          provide: TwentyConfigService,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OpenApiService>(OpenApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
