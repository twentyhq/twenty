import { Test, type TestingModule } from '@nestjs/testing';

import { AdminPanelConfigService } from 'src/engine/core-modules/admin-panel/services/admin-panel-config.service';
import { AdminPanelVersionService } from 'src/engine/core-modules/admin-panel/services/admin-panel-version.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const TwentyConfigServiceGetAllMock = jest.fn();
const TwentyConfigServiceGetVariableWithMetadataMock = jest.fn();
const mockHttpClientGet = jest.fn();
const mockGetHttpClient = jest.fn().mockReturnValue({ get: mockHttpClientGet });

jest.mock(
  'src/engine/core-modules/twenty-config/constants/config-variables-group-metadata',
  () => ({
    CONFIG_VARIABLES_GROUP_METADATA: {
      SERVER_CONFIG: {
        position: 100,
        description: 'Server config description',
        isHiddenOnLoad: false,
      },
      RATE_LIMITING: {
        position: 200,
        description: 'Rate limiting description',
        isHiddenOnLoad: false,
      },
      OTHER: {
        position: 300,
        description: 'Other description',
        isHiddenOnLoad: true,
      },
    },
  }),
);

describe('AdminPanelConfigService', () => {
  let configService: AdminPanelConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelConfigService,
        {
          provide: TwentyConfigService,
          useValue: {
            getAll: TwentyConfigServiceGetAllMock,
            getVariableWithMetadata:
              TwentyConfigServiceGetVariableWithMetadataMock,
          },
        },
      ],
    }).compile();

    configService = module.get<AdminPanelConfigService>(
      AdminPanelConfigService,
    );
  });

  it('should be defined', async () => {
    expect(configService).toBeDefined();
  });

  describe('getConfigVariablesGrouped', () => {
    it('should correctly group and sort config variables', () => {
      TwentyConfigServiceGetAllMock.mockReturnValue({
        SERVER_URL: {
          value: 'http://localhost',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'Server URL',
            type: 'string',
            options: undefined,
          },
          source: 'env',
        },
        RATE_LIMIT_TTL: {
          value: 60,
          metadata: {
            group: 'RATE_LIMITING',
            description: 'Rate limit TTL',
            type: 'number',
            options: undefined,
          },
          source: 'env',
        },
        API_KEY: {
          value: 'secret-key',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'API Key',
            isSensitive: true,
            type: 'string',
            options: undefined,
          },
          source: 'env',
        },
        OTHER_VAR: {
          value: 'other',
          metadata: {
            group: 'OTHER',
            description: 'Other var',
            type: 'string',
            options: undefined,
          },
          source: 'env',
        },
      });

      const result = configService.getConfigVariablesGrouped();

      expect(result).toEqual({
        groups: [
          {
            name: 'SERVER_CONFIG',
            description: 'Server config description',
            isHiddenOnLoad: false,
            variables: [
              {
                name: 'API_KEY',
                value: 'secret-key',
                description: 'API Key',
                isSensitive: true,
                isEnvOnly: false,
                type: 'string',
                options: undefined,
                source: 'env',
              },
              {
                name: 'SERVER_URL',
                value: 'http://localhost',
                description: 'Server URL',
                isSensitive: false,
                isEnvOnly: false,
                type: 'string',
                options: undefined,
                source: 'env',
              },
            ],
          },
          {
            name: 'RATE_LIMITING',
            description: 'Rate limiting description',
            isHiddenOnLoad: false,
            variables: [
              {
                name: 'RATE_LIMIT_TTL',
                value: 60,
                description: 'Rate limit TTL',
                isSensitive: false,
                isEnvOnly: false,
                type: 'number',
                options: undefined,
                source: 'env',
              },
            ],
          },
          {
            name: 'OTHER',
            description: 'Other description',
            isHiddenOnLoad: true,
            variables: [
              {
                name: 'OTHER_VAR',
                value: 'other',
                description: 'Other var',
                isSensitive: false,
                isEnvOnly: false,
                type: 'string',
                options: undefined,
                source: 'env',
              },
            ],
          },
        ],
      });

      expect(result.groups[0].name).toBe('SERVER_CONFIG');
      expect(result.groups[1].name).toBe('RATE_LIMITING');
      expect(result.groups[2].name).toBe('OTHER');
    });

    it('should handle empty config variables', () => {
      TwentyConfigServiceGetAllMock.mockReturnValue({});

      const result = configService.getConfigVariablesGrouped();

      expect(result).toEqual({
        groups: [],
      });
    });

    it('should handle variables with undefined metadata fields', () => {
      TwentyConfigServiceGetAllMock.mockReturnValue({
        TEST_VAR: {
          value: 'test',
          metadata: {
            group: 'SERVER_CONFIG',
            type: 'string',
            options: undefined,
          },
          source: 'env',
        },
      });

      const result = configService.getConfigVariablesGrouped();

      expect(result.groups[0].variables[0]).toEqual({
        name: 'TEST_VAR',
        value: 'test',
        description: undefined,
        isSensitive: false,
        isEnvOnly: false,
        options: undefined,
        source: 'env',
        type: 'string',
      });
    });
  });

  describe('getConfigVariable', () => {
    it('should return config variable with all fields', () => {
      TwentyConfigServiceGetVariableWithMetadataMock.mockReturnValue({
        value: 'test-value',
        metadata: {
          group: 'SERVER_CONFIG',
          description: 'Test description',
          isSensitive: true,
          isEnvOnly: true,
          type: 'string',
          options: ['option1', 'option2'],
        },
        source: 'env',
      });

      const result = configService.getConfigVariable('SERVER_URL');

      expect(result).toEqual({
        name: 'SERVER_URL',
        value: 'test-value',
        description: 'Test description',
        isSensitive: true,
        isEnvOnly: true,
        type: 'string',
        options: ['option1', 'option2'],
        source: 'env',
      });
    });

    it('should throw error when variable not found', () => {
      TwentyConfigServiceGetVariableWithMetadataMock.mockReturnValue(undefined);

      expect(() => configService.getConfigVariable('INVALID_VAR')).toThrow(
        'Config variable INVALID_VAR not found',
      );
    });
  });
});

describe('AdminPanelVersionService', () => {
  let versionService: AdminPanelVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelVersionService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: SecureHttpClientService,
          useValue: {
            getHttpClient: mockGetHttpClient,
          },
        },
      ],
    }).compile();

    versionService = module.get<AdminPanelVersionService>(
      AdminPanelVersionService,
    );
  });

  describe('getVersionInfo', () => {
    const mockEnvironmentGet = jest.fn();

    beforeEach(() => {
      mockEnvironmentGet.mockReset();
      mockHttpClientGet.mockReset();
      versionService['twentyConfigService'].get = mockEnvironmentGet;
    });

    it('should return current and latest version when everything works', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockHttpClientGet.mockResolvedValue({
        data: {
          results: [
            { name: '2.0.0' },
            { name: '1.5.0' },
            { name: '1.0.0' },
            { name: 'latest' },
          ],
        },
      });

      const result = await versionService.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '2.0.0',
      });
    });

    it('should handle undefined APP_VERSION', async () => {
      mockEnvironmentGet.mockReturnValue(undefined);
      mockHttpClientGet.mockResolvedValue({
        data: {
          results: [{ name: '2.0.0' }, { name: 'latest' }],
        },
      });

      const result = await versionService.getVersionInfo();

      expect(result).toEqual({
        currentVersion: undefined,
        latestVersion: '2.0.0',
      });
    });

    it('should handle Docker Hub API error', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockHttpClientGet.mockRejectedValue(new Error('API Error'));

      const result = await versionService.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: 'latest',
      });
    });

    it('should handle empty Docker Hub tags', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockHttpClientGet.mockResolvedValue({
        data: {
          results: [],
        },
      });

      const result = await versionService.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: 'latest',
      });
    });

    it('should handle invalid semver tags', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockHttpClientGet.mockResolvedValue({
        data: {
          results: [
            { name: '2.0.0' },
            { name: 'invalid-version' },
            { name: 'latest' },
            { name: '1.0.0' },
          ],
        },
      });

      const result = await versionService.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '2.0.0',
      });
    });
  });
});
