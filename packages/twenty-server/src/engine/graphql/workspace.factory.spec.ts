import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/engine-metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine-metadata/object-metadata/object-metadata.service';
import { WorkspaceSchemaStorageService } from 'src/engine/graphql/workspace-schema-storage/workspace-schema-storage.service';
import { ScalarsExplorerService } from 'src/engine-workspace/services/scalars-explorer.service';
import { WorkspaceResolverFactory } from 'src/engine/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from 'src/engine/graphql/workspace-schema-builder/workspace-graphql-schema.factory';

import { WorkspaceFactory } from './workspace.factory';

describe('WorkspaceFactory', () => {
  let service: WorkspaceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceFactory,
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

    service = module.get<WorkspaceFactory>(WorkspaceFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
