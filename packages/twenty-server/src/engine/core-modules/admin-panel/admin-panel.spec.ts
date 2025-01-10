import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { expect, jest } from '@jest/globals';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { LoginTokenService } from 'src/engine/core-modules/auth/token/services/login-token.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

const UserFindOneMock = jest.fn();
const WorkspaceFindOneMock = jest.fn();
const FeatureFlagUpdateMock = jest.fn();
const FeatureFlagSaveMock = jest.fn();
const LoginTokenServiceGenerateLoginTokenMock = jest.fn();

jest.mock(
  'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum',
  () => {
    return {
      FeatureFlagKey: {
        IsFlagEnabled: 'IS_FLAG_ENABLED',
      },
    };
  },
);

describe('AdminPanelService', () => {
  let service: AdminPanelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOne: WorkspaceFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(FeatureFlagEntity, 'core'),
          useValue: {
            update: FeatureFlagUpdateMock,
            save: FeatureFlagSaveMock,
          },
        },
        {
          provide: LoginTokenService,
          useValue: {
            generateLoginToken: LoginTokenServiceGenerateLoginTokenMock,
          },
        },
      ],
    }).compile();

    service = module.get<AdminPanelService>(AdminPanelService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should update an existing feature flag if it exists', async () => {
    const workspaceId = 'workspace-id';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;
    const existingFlag = {
      id: 'flag-id',
      key: 'IS_FLAG_ENABLED',
      value: false,
    };

    WorkspaceFindOneMock.mockReturnValueOnce({
      id: workspaceId,
      featureFlags: [existingFlag],
    });

    await service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value);

    expect(FeatureFlagUpdateMock).toHaveBeenCalledWith(existingFlag.id, {
      value,
    });
    expect(FeatureFlagSaveMock).not.toHaveBeenCalled();
  });

  it('should create a new feature flag if it does not exist', async () => {
    const workspaceId = 'workspace-id';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce({
      id: workspaceId,
      featureFlags: [],
    });

    await service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value);

    expect(FeatureFlagSaveMock).toHaveBeenCalledWith({
      key: 'IS_FLAG_ENABLED',
      value,
      workspaceId,
    });
    expect(FeatureFlagUpdateMock).not.toHaveBeenCalled();
  });

  it('should throw an exception if the workspace is not found', async () => {
    const workspaceId = 'non-existent-workspace';
    const featureFlag = 'IsFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value),
    ).rejects.toThrowError(
      new AuthException('Workspace not found', AuthExceptionCode.INVALID_INPUT),
    );
  });

  it('should throw an exception if the flag is not found', async () => {
    const workspaceId = 'non-existent-workspace';
    const featureFlag = 'IsUnknownFlagEnabled' as FeatureFlagKey;
    const value = true;

    WorkspaceFindOneMock.mockReturnValueOnce(null);

    await expect(
      service.updateWorkspaceFeatureFlags(workspaceId, featureFlag, value),
    ).rejects.toThrowError(
      new AuthException(
        'Invalid feature flag key',
        AuthExceptionCode.INVALID_INPUT,
      ),
    );
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
          subdomain: 'example-subdomain',
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
});
