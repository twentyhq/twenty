import { SCHEMA_SDL_CACHE_DEPENDENCIES } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/constants/schema-sdl-cache-dependencies.constant';
import { WorkspaceGraphqlSchemaSDLService } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/workspace-graphql-schema-sdl.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const workspace = { id: 'workspace-id' } as FlatWorkspace;

const buildHashes = (hash: string) =>
  Object.fromEntries(
    SCHEMA_SDL_CACHE_DEPENDENCIES.map((cacheKeyName) => [cacheKeyName, hash]),
  );

const buildService = () => {
  const getOrRecomputeManyOrAllFlatEntityMapsWithHashes = jest
    .fn()
    .mockResolvedValue({ hashes: buildHashes('first') });
  const service = new (WorkspaceGraphqlSchemaSDLService as unknown as new (
    ...dependencies: unknown[]
  ) => WorkspaceGraphqlSchemaSDLService)(
    undefined,
    undefined,
    { getOrRecomputeManyOrAllFlatEntityMapsWithHashes },
    undefined,
  );
  const getOrComputeSchemaSDL = jest
    .spyOn(service, 'getOrComputeSchemaSDL')
    .mockResolvedValue({
      sdl: 'type Query { company: String }',
    } as Awaited<ReturnType<typeof service.getOrComputeSchemaSDL>>);

  return {
    service,
    getOrComputeSchemaSDL,
    getOrRecomputeManyOrAllFlatEntityMapsWithHashes,
  };
};

describe('WorkspaceGraphqlSchemaSDLService.getOrComputeSchema', () => {
  it('builds the schema once while the metadata is unchanged', async () => {
    const { service, getOrComputeSchemaSDL } = buildService();

    const firstSchema = await service.getOrComputeSchema({ workspace });
    const secondSchema = await service.getOrComputeSchema({ workspace });

    expect(firstSchema?.getQueryType()?.getFields().company).toBeDefined();
    expect(secondSchema).toBe(firstSchema);
    expect(getOrComputeSchemaSDL).toHaveBeenCalledTimes(1);
  });

  it('shares one build between concurrent requests', async () => {
    const { service, getOrComputeSchemaSDL } = buildService();

    const [firstSchema, secondSchema] = await Promise.all([
      service.getOrComputeSchema({ workspace }),
      service.getOrComputeSchema({ workspace }),
    ]);

    expect(secondSchema).toBe(firstSchema);
    expect(getOrComputeSchemaSDL).toHaveBeenCalledTimes(1);
  });

  it('builds a new schema when the metadata changes', async () => {
    const {
      service,
      getOrComputeSchemaSDL,
      getOrRecomputeManyOrAllFlatEntityMapsWithHashes,
    } = buildService();

    const firstSchema = await service.getOrComputeSchema({ workspace });

    getOrRecomputeManyOrAllFlatEntityMapsWithHashes.mockResolvedValue({
      hashes: buildHashes('second'),
    });

    const secondSchema = await service.getOrComputeSchema({ workspace });

    expect(secondSchema).not.toBe(firstSchema);
    expect(getOrComputeSchemaSDL).toHaveBeenCalledTimes(2);
  });

  it('keeps one schema per application', async () => {
    const { service } = buildService();

    const workspaceSchema = await service.getOrComputeSchema({ workspace });
    const applicationSchema = await service.getOrComputeSchema({
      workspace,
      applicationId: 'application-id',
    });

    expect(applicationSchema).not.toBe(workspaceSchema);
    expect(await service.getOrComputeSchema({ workspace })).toBe(
      workspaceSchema,
    );
  });
});
