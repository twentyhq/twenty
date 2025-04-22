import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';

import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { User } from 'src/engine/core-modules/user/user.entity';

const UserFindOneMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();
const TwentyConfigServiceGetAllMock = jest.fn();

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
          provide: getRepositoryToken(User, 'core'),
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
          provide: DomainManagerService,
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
          },
        },
      ],
    }).compile();

    service = module.get<AdminPanelService>(AdminPanelService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should impersonate a user and return workspace and loginToken on success', async () => {
    const mockUser = {
      id: 'user-id',
      email: 'user@example.com',
      workspaces: [
        {
          workspace: {
            id: 'workspace-id',
            allowImpersonation: true,
            subdomain: 'example-subdomain',
          },
        },
      ],
    };

    UserFindOneMock.mockReturnValueOnce(mockUser);
    LoginTokenServiceGenerateLoginTokenMock.mockReturnValueOnce({
      token: 'mock-login-token',
      expiresAt: new Date(),
    });

    const result = await service.impersonate('user-id', 'workspace-id');

    expect(UserFindOneMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'user-id',
          workspaces: {
            workspaceId: 'workspace-id',
            workspace: { allowImpersonation: true },
          },
        }),
        relations: ['workspaces', 'workspaces.workspace'],
      }),
    );

    expect(LoginTokenServiceGenerateLoginTokenMock).toHaveBeenCalledWith(
      'user@example.com',
      'workspace-id',
    );

    expect(result).toEqual(
      expect.objectContaining({
        workspace: {
          id: 'workspace-id',
          workspaceUrls: {
            customUrl: undefined,
            subdomainUrl: 'https://twenty.twenty.com',
          },
        },
        loginToken: expect.objectContaining({
          token: 'mock-login-token',
          expiresAt: expect.any(Date),
        }),
      }),
    );
  });

  it('should throw an error when user is not found', async () => {
    UserFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.impersonate('invalid-user-id', 'workspace-id'),
    ).rejects.toThrow(
      new AuthException(
        'User not found or impersonation not enable on workspace',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );

    expect(UserFindOneMock).toHaveBeenCalled();
  });

  describe('getConfigVariablesGrouped', () => {
    it('should correctly group and sort config variables', () => {
      TwentyConfigServiceGetAllMock.mockReturnValue({
        SERVER_URL: {
          value: 'http://localhost',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'Server URL',
          },
        },
        RATE_LIMIT_TTL: {
          value: '60',
          metadata: {
            group: 'RATE_LIMITING',
            description: 'Rate limit TTL',
          },
        },
        API_KEY: {
          value: 'secret-key',
          metadata: {
            group: 'SERVER_CONFIG',
            description: 'API Key',
            isSensitive: true,
          },
        },
        OTHER_VAR: {
          value: 'other',
          metadata: {
            group: 'OTHER',
            description: 'Other var',
          },
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
              },
              {
                name: 'SERVER_URL',
                value: 'http://localhost',
                description: 'Server URL',
                isSensitive: false,
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
                value: '60',
                description: 'Rate limit TTL',
                isSensitive: false,
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
          },
        },
      });

      const result = service.getConfigVariablesGrouped();

      expect(result.groups[0].variables[0]).toEqual({
        name: 'TEST_VAR',
        value: 'test',
        description: undefined,
        isSensitive: false,
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
});
