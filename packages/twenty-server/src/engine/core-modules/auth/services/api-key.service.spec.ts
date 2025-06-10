import { Test, TestingModule } from '@nestjs/testing';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ApiKeyService } from './api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let jwtWrapperService: JwtWrapperService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: JwtWrapperService,
          useValue: {
            sign: jest.fn(),
            generateAppSecret: jest.fn().mockReturnValue('mocked-secret'),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
    jwtWrapperService = module.get<JwtWrapperService>(JwtWrapperService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApiKeyToken', () => {
    it('should return undefined if apiKeyId is not provided', async () => {
      const result = await service.generateApiKeyToken('workspace-id');

      expect(result).toBeUndefined();
    });

    it('should generate an API key token successfully', async () => {
      const workspaceId = 'workspace-id';
      const apiKeyId = 'api-key-id';
      const mockToken = 'mock-token';

      jest.spyOn(twentyConfigService, 'get').mockReturnValue('1h');
      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);
      jest
        .spyOn(jwtWrapperService, 'generateAppSecret')
        .mockReturnValue('mocked-secret');

      const result = await service.generateApiKeyToken(workspaceId, apiKeyId);

      expect(result).toEqual({ token: mockToken });
      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: workspaceId,
          type: 'API_KEY',
          workspaceId: workspaceId,
        },
        expect.objectContaining({
          secret: 'mocked-secret',
          expiresIn: '100y',
          jwtid: apiKeyId,
        }),
      );
    });

    it('should use custom expiration time if provided', async () => {
      const workspaceId = 'workspace-id';
      const apiKeyId = 'api-key-id';
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
      const mockToken = 'mock-token';

      jest.spyOn(jwtWrapperService, 'sign').mockReturnValue(mockToken);
      jest
        .spyOn(jwtWrapperService, 'generateAppSecret')
        .mockReturnValue('mocked-secret');

      await service.generateApiKeyToken(workspaceId, apiKeyId, expiresAt);

      expect(jwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: workspaceId,
          type: 'API_KEY',
          workspaceId: workspaceId,
        },
        expect.objectContaining({
          secret: 'mocked-secret',
          expiresIn: expect.any(Number),
          jwtid: apiKeyId,
        }),
      );
    });
  });
});
