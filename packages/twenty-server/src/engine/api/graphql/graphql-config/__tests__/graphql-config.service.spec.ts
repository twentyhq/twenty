import { GraphQLConfigService } from 'src/engine/api/graphql/graphql-config/graphql-config.service';

describe('GraphQLConfigService', () => {
  let service: GraphQLConfigService;

  beforeEach(() => {
    const mockExceptionHandlerService = {} as any;
    const mockTwentyConfigService = {
      get: jest.fn().mockReturnValue('test'),
    } as any;
    const mockModuleRef = {} as any;
    const mockMetricsService = {} as any;
    const mockDataloaderService = {
      createLoaders: jest.fn().mockReturnValue({}),
    } as any;
    const mockI18nService = {} as any;

    service = new GraphQLConfigService(
      mockExceptionHandlerService,
      mockTwentyConfigService,
      mockModuleRef,
      mockMetricsService,
      mockDataloaderService,
      mockI18nService,
    );
  });

  describe('createGqlOptions', () => {
    it('should include autoSchemaFile for core-engine resolvers', () => {
      const config = service.createGqlOptions();

      expect(config).toHaveProperty('autoSchemaFile', true);
    });

    it('should include CoreEngineModule in include list', () => {
      const config = service.createGqlOptions();

      expect(config).toHaveProperty('include');
      expect(config.include).toHaveLength(1);
    });

    it('should include buildSchemaOptions with orphanedTypes', () => {
      const config = service.createGqlOptions();

      expect(config).toHaveProperty('buildSchemaOptions');
      expect(config.buildSchemaOptions?.orphanedTypes).toBeDefined();
      expect(config.buildSchemaOptions!.orphanedTypes!.length).toBeGreaterThan(
        0,
      );
    });

    it('should include conditionalSchema in the config', () => {
      const config = service.createGqlOptions();

      expect(config).toHaveProperty('conditionalSchema');
      expect(typeof config.conditionalSchema).toBe('function');
    });

    it('should include resolvers with JSON scalar', () => {
      const config = service.createGqlOptions();

      expect(config.resolvers).toBeDefined();
      expect(config.resolvers).toHaveProperty('JSON');
    });

    it('should include plugins', () => {
      const config = service.createGqlOptions();

      expect(config.plugins).toBeDefined();
      expect(config.plugins!.length).toBeGreaterThan(0);
    });
  });
});
