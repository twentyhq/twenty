import { Test, type TestingModule } from '@nestjs/testing';

import { ScalarsExplorerService } from 'src/engine/api/graphql/services/scalars-explorer.service';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { WorkspaceResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver.factory';
import { WorkspaceSchemaFactory } from 'src/engine/api/graphql/workspace-schema.factory';

describe('WorkspaceSchemaFactory', () => {
  let service: WorkspaceSchemaFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceSchemaFactory,
        {
          provide: ScalarsExplorerService,
          useValue: {},
        },
        {
          provide: WorkspaceResolverFactory,
          useValue: {},
        },
        {
          provide: WorkspaceGraphqlSchemaSDLService,
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
