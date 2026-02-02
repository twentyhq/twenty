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
    it('should not include autoSchemaFile in the config', () => {
      const config = service.createGqlOptions();

      expect(config).not.toHaveProperty('autoSchemaFile');
    });

    it('should not include include property in the config', () => {
      const config = service.createGqlOptions();

      expect(config).not.toHaveProperty('include');
    });

    it('should not include buildSchemaOptions in the config', () => {
      const config = service.createGqlOptions();

      expect(config).not.toHaveProperty('buildSchemaOptions');
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
