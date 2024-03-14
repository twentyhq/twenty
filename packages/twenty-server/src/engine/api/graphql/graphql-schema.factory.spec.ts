import { Test, TestingModule } from '@nestjs/testing';

import { DataSourceService } from 'src/engine/api/metadata/data-source/data-source.service';
import { ObjectMetadataService } from 'src/engine/api/metadata/object-metadata/object-metadata.service';
import { WorkspaceSchemaStorageService } from 'src/engine/api/graphql/workspace-schema-storage/workspace-schema-storage.service';
import { ScalarsExplorerService } from 'src/engine/api/graphql/scalars-explorer.service';

import { GraphQLSchemaFactory } from './graphql-schema.factory';

import { WorkspaceResolverFactory } from './workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceGraphQLSchemaFactory } from './workspace-schema-builder/workspace-graphql-schema.factory';

describe('GraphQLSchemaFactory', () => {
  let service: GraphQLSchemaFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphQLSchemaFactory,
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

    service = module.get<GraphQLSchemaFactory>(GraphQLSchemaFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
