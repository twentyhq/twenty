import { GraphQLSchema } from 'graphql';

import { metadataModuleFactory } from 'src/engine/api/graphql/metadata.module-factory';

describe('metadataModuleFactory', () => {
  const mockSchema = new GraphQLSchema({});

  const mockTwentyConfigService = {
    get: jest.fn().mockReturnValue('test'),
  } as any;
  const mockExceptionHandlerService = {} as any;
  const mockDataloaderService = {
    createLoaders: jest.fn().mockReturnValue({}),
  } as any;
  const mockCacheStorageService = {
    get: jest.fn(),
    set: jest.fn(),
  } as any;
  const mockMetricsService = {} as any;
  const mockI18nService = {} as any;
  const mockGraphQLSchemaFactory = {
    create: jest.fn().mockResolvedValue(mockSchema),
  } as any;

  it('should build schema explicitly using GraphQLSchemaFactory', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(mockGraphQLSchemaFactory.create).toHaveBeenCalledTimes(1);
    expect(mockGraphQLSchemaFactory.create).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ numberScalarMode: 'integer' }),
    );
  });

  it('should not include autoSchemaFile in the config', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config).not.toHaveProperty('autoSchemaFile');
  });

  it('should not include include property in the config', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config).not.toHaveProperty('include');
  });

  it('should set the schema property from GraphQLSchemaFactory', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config.schema).toBe(mockSchema);
  });

  it('should set path to /metadata', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config.path).toBe('/metadata');
  });

  it('should include resolvers with JSON scalar', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config.resolvers).toHaveProperty('JSON');
  });

  it('should include plugins', async () => {
    const config = await metadataModuleFactory(
      mockTwentyConfigService,
      mockExceptionHandlerService,
      mockDataloaderService,
      mockCacheStorageService,
      mockMetricsService,
      mockI18nService,
      mockGraphQLSchemaFactory,
    );

    expect(config.plugins).toBeDefined();
    expect(config.plugins!.length).toBeGreaterThan(0);
  });
});
