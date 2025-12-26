import { Test, type TestingModule } from '@nestjs/testing';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaGenerator } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('WorkspaceSchemaFactory', () => {
  let service: WorkspaceSchemaFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceSchemaFactory,
        {
          provide: DataSourceService,
          useValue: {},
        },
        {
          provide: ObjectMetadataService,
          useValue: {},
        },
        {
          provide: ScalarsExplorerService,
          useValue: {},
        },
        {
          provide: WorkspaceGraphQLSchemaGenerator,
          useValue: {},
        },
        {
          provide: WorkspaceResolverFactory,
          useValue: {},
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: {},
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {},
        },
        {
          provide: TwentyConfigService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceSchemaFactory>(WorkspaceSchemaFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
