import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { RestApiMetadataService } from './rest-api-metadata.service';
import { MetadataQueryBuilderFactory } from '../query-builder/metadata-query-builder.factory';
import { RestApiService } from '../rest-api.service';
import { AccessTokenService } from '../../../core-modules/auth/token/services/access-token.service';
import { TwentyConfigService } from '../../../core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheStorageService } from '../../../workspace-cache-storage/workspace-cache-storage.service';

describe('RestApiMetadataService', () => {
  let service: RestApiMetadataService;
  let accessTokenService: jest.Mocked<AccessTokenService>;
  let metadataQueryBuilderFactory: jest.Mocked<MetadataQueryBuilderFactory>;
  let restApiService: jest.Mocked<RestApiService>;
  let twentyConfigService: jest.Mocked<TwentyConfigService>;
  let workspaceCacheStorageService: jest.Mocked<WorkspaceCacheStorageService>;

  beforeEach(async () => {
    const mockAccessTokenService = {
      validateTokenByRequest: jest.fn(),
    };

    const mockMetadataQueryBuilderFactory = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };

    const mockRestApiService = {
      call: jest.fn(),
    };

    const mockTwentyConfigService = {
      get: jest.fn(),
    };

    const mockWorkspaceCacheStorageService = {
      flushVersionedMetadata: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestApiMetadataService,
        {
          provide: AccessTokenService,
          useValue: mockAccessTokenService,
        },
        {
          provide: MetadataQueryBuilderFactory,
          useValue: mockMetadataQueryBuilderFactory,
        },
        {
          provide: RestApiService,
          useValue: mockRestApiService,
        },
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: mockWorkspaceCacheStorageService,
        },
      ],
    }).compile();

    service = module.get<RestApiMetadataService>(RestApiMetadataService);
    accessTokenService = module.get(AccessTokenService);
    metadataQueryBuilderFactory = module.get(MetadataQueryBuilderFactory);
    restApiService = module.get(RestApiService);
    twentyConfigService = module.get(TwentyConfigService);
    workspaceCacheStorageService = module.get(WorkspaceCacheStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should invalidate GraphQL schema cache after successful creation', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        protocol: 'https',
        get: jest.fn().mockReturnValue('localhost:3000'),
        url: '/rest/metadata/object',
      } as unknown as Request;

      const mockRequestContext = {
        body: { name: 'TestObject' },
        baseUrl: 'https://localhost:3000',
        path: '/rest/metadata/object',
        headers: mockRequest.headers,
      };

      const mockResult = { data: { data: { id: '123' } } };

      accessTokenService.validateTokenByRequest.mockResolvedValue(undefined);
      metadataQueryBuilderFactory.create.mockResolvedValue({ query: 'mutation' });
      restApiService.call.mockResolvedValue(mockResult);

      // Mock workspace context
      const mockAuthenticatedRequest = {
        ...mockRequest,
        workspace: { id: 'workspace-123' },
      };

      jest.spyOn(service as any, 'getRequestContext').mockReturnValue(mockRequestContext);
      jest.spyOn(service as any, 'invalidateGraphQLSchemaCache').mockResolvedValue(undefined);

      // Act
      const result = await service.create(mockRequest);

      // Assert
      expect(accessTokenService.validateTokenByRequest).toHaveBeenCalledWith(mockRequest);
      expect(metadataQueryBuilderFactory.create).toHaveBeenCalledWith(mockRequestContext, { fields: ['*'] });
      expect(restApiService.call).toHaveBeenCalled();
      expect(service['invalidateGraphQLSchemaCache']).toHaveBeenCalledWith(mockRequestContext);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should invalidate GraphQL schema cache after successful update', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        protocol: 'https',
        get: jest.fn().mockReturnValue('localhost:3000'),
        url: '/rest/metadata/object/123',
      } as unknown as Request;

      const mockRequestContext = {
        body: { name: 'UpdatedObject' },
        baseUrl: 'https://localhost:3000',
        path: '/rest/metadata/object/123',
        headers: mockRequest.headers,
      };

      const mockResult = { data: { data: { id: '123' } } };

      accessTokenService.validateTokenByRequest.mockResolvedValue(undefined);
      metadataQueryBuilderFactory.update.mockResolvedValue({ query: 'mutation' });
      restApiService.call.mockResolvedValue(mockResult);

      jest.spyOn(service as any, 'getRequestContext').mockReturnValue(mockRequestContext);
      jest.spyOn(service as any, 'invalidateGraphQLSchemaCache').mockResolvedValue(undefined);

      // Act
      const result = await service.update(mockRequest);

      // Assert
      expect(accessTokenService.validateTokenByRequest).toHaveBeenCalledWith(mockRequest);
      expect(metadataQueryBuilderFactory.update).toHaveBeenCalledWith(mockRequestContext, { fields: ['*'] });
      expect(restApiService.call).toHaveBeenCalled();
      expect(service['invalidateGraphQLSchemaCache']).toHaveBeenCalledWith(mockRequestContext);
      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should invalidate GraphQL schema cache after successful deletion', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        protocol: 'https',
        get: jest.fn().mockReturnValue('localhost:3000'),
        url: '/rest/metadata/object/123',
      } as unknown as Request;

      const mockRequestContext = {
        body: {},
        baseUrl: 'https://localhost:3000',
        path: '/rest/metadata/object/123',
        headers: mockRequest.headers,
      };

      const mockResult = { data: { data: { id: '123' } } };

      accessTokenService.validateTokenByRequest.mockResolvedValue(undefined);
      metadataQueryBuilderFactory.delete.mockResolvedValue({ query: 'mutation' });
      restApiService.call.mockResolvedValue(mockResult);

      jest.spyOn(service as any, 'getRequestContext').mockReturnValue(mockRequestContext);
      jest.spyOn(service as any, 'invalidateGraphQLSchemaCache').mockResolvedValue(undefined);

      // Act
      const result = await service.delete(mockRequest);

      // Assert
      expect(accessTokenService.validateTokenByRequest).toHaveBeenCalledWith(mockRequest);
      expect(metadataQueryBuilderFactory.delete).toHaveBeenCalledWith(mockRequestContext);
      expect(restApiService.call).toHaveBeenCalled();
      expect(service['invalidateGraphQLSchemaCache']).toHaveBeenCalledWith(mockRequestContext);
      expect(result).toEqual(mockResult);
    });
  });

  describe('invalidateGraphQLSchemaCache', () => {
    it('should call flushVersionedMetadata when workspace ID is available', async () => {
      // Arrange
      const mockRequestContext = {
        workspace: { id: 'workspace-123' },
      } as any;

      // Act
      await service['invalidateGraphQLSchemaCache'](mockRequestContext);

      // Assert
      expect(workspaceCacheStorageService.flushVersionedMetadata).toHaveBeenCalledWith('workspace-123');
    });

    it('should not call flushVersionedMetadata when workspace ID is not available', async () => {
      // Arrange
      const mockRequestContext = {} as any;

      // Act
      await service['invalidateGraphQLSchemaCache'](mockRequestContext);

      // Assert
      expect(workspaceCacheStorageService.flushVersionedMetadata).not.toHaveBeenCalled();
    });
  });
});
