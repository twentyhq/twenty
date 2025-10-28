import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';

import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

const UserFindOneMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();
const TwentyConfigServiceGetAllMock = jest.fn();
const TwentyConfigServiceGetVariableWithMetadataMock = jest.fn();

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

describe('AdminPanelService', () => {
  let service: AdminPanelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: UserFindOneMock,
          },
        },
        {
          provide: LoginTokenService,
          useValue: {
            generateLoginToken: LoginTokenServiceGenerateLoginTokenMock,
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: {
            getWorkspaceUrls: jest.fn().mockReturnValue({
              customUrl: undefined,
              subdomainUrl: 'https://twenty.twenty.com',
            }),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            getAll: TwentyConfigServiceGetAllMock,
            getVariableWithMetadata:
              TwentyConfigServiceGetVariableWithMetadataMock,
          },
        },
        {
          provide: AuditService,
          useValue: {
            createContext: jest.fn().mockReturnValue({
              insertWorkspaceEvent: jest.fn(),
            }),
          },
        },
        {
          provide: FileService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminPanelService>(AdminPanelService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
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

      const result = service.getConfigVariablesGrouped();

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

      const result = service.getConfigVariablesGrouped();

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

      const result = service.getConfigVariablesGrouped();

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

  describe('getVersionInfo', () => {
    const mockEnvironmentGet = jest.fn();
    const mockAxiosGet = jest.fn();

    beforeEach(() => {
      mockEnvironmentGet.mockReset();
      mockAxiosGet.mockReset();
      jest.spyOn(axios, 'get').mockImplementation(mockAxiosGet);
      service['twentyConfigService'].get = mockEnvironmentGet;
    });

    it('should return current and latest version when everything works', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockAxiosGet.mockResolvedValue({
        data: {
          results: [
            { name: '2.0.0' },
            { name: '1.5.0' },
            { name: '1.0.0' },
            { name: 'latest' },
          ],
        },
      });

      const result = await service.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '2.0.0',
      });
    });

    it('should handle undefined APP_VERSION', async () => {
      mockEnvironmentGet.mockReturnValue(undefined);
      mockAxiosGet.mockResolvedValue({
        data: {
          results: [{ name: '2.0.0' }, { name: 'latest' }],
        },
      });

      const result = await service.getVersionInfo();

      expect(result).toEqual({
        currentVersion: undefined,
        latestVersion: '2.0.0',
      });
    });

    it('should handle Docker Hub API error', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockAxiosGet.mockRejectedValue(new Error('API Error'));

      const result = await service.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: 'latest',
      });
    });

    it('should handle empty Docker Hub tags', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockAxiosGet.mockResolvedValue({
        data: {
          results: [],
        },
      });

      const result = await service.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: 'latest',
      });
    });

    it('should handle invalid semver tags', async () => {
      mockEnvironmentGet.mockReturnValue('1.0.0');
      mockAxiosGet.mockResolvedValue({
        data: {
          results: [
            { name: '2.0.0' },
            { name: 'invalid-version' },
            { name: 'latest' },
            { name: '1.0.0' },
          ],
        },
      });

      const result = await service.getVersionInfo();

      expect(result).toEqual({
        currentVersion: '1.0.0',
        latestVersion: '2.0.0',
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

      const result = service.getConfigVariable('SERVER_URL');

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

      expect(() => service.getConfigVariable('INVALID_VAR')).toThrow(
        'Config variable INVALID_VAR not found',
      );
    });
  });
});
