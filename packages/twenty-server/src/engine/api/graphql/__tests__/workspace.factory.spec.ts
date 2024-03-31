import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceSchemaStorageService } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.service';
import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from 'src/engine/api/graphql/workspace-schema-builder/workspace-graphql-schema.factory';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';

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
          provide: WorkspaceGraphQLSchemaFactory,
          useValue: {},
        },
        {
          provide: WorkspaceResolverFactory,
          useValue: {},
        },
        {
          provide: WorkspaceSchemaStorageService,
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
