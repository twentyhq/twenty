import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationWorkspaceMemberTokenService } from 'src/engine/core-modules/application/application-oauth/services/application-workspace-member-token.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION = { id: 'application-id' } as FlatApplication;
const WORKSPACE_MEMBER_ID = 'member-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const TOKEN_PAIR = {
  applicationAccessToken: { token: 'access', expiresAt: new Date() },
  applicationRefreshToken: { token: 'refresh', expiresAt: new Date() },
};

describe('ApplicationWorkspaceMemberTokenService', () => {
  let service: ApplicationWorkspaceMemberTokenService;

  const applicationTokenService = {
    generateApplicationTokenPair: jest.fn(),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn(),
  };
  const userWorkspaceRepository = {
    findOne: jest.fn(),
  };

  const generate = (
    overrides: Partial<
      Parameters<
        ApplicationWorkspaceMemberTokenService['generateTokenPairForWorkspaceMember']
      >[0]
    > = {},
  ) =>
    service.generateTokenPairForWorkspaceMember({
      workspaceId: WORKSPACE_ID,
      application: APPLICATION,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      ...overrides,
    });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationWorkspaceMemberTokenService,
        { provide: ApplicationTokenService, useValue: applicationTokenService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
      ],
    }).compile();

    service = module.get(ApplicationWorkspaceMemberTokenService);

    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatWorkspaceMemberMaps: {
        byId: {
          [WORKSPACE_MEMBER_ID]: {
            id: WORKSPACE_MEMBER_ID,
            userId: USER_ID,
            deletedAt: null,
          },
        },
        idByUserId: { [USER_ID]: WORKSPACE_MEMBER_ID },
      },
    });
    userWorkspaceRepository.findOne.mockResolvedValue({
      id: USER_WORKSPACE_ID,
    });
    applicationTokenService.generateApplicationTokenPair.mockResolvedValue(
      TOKEN_PAIR,
    );
  });

  it('should issue a token pair bound to the member and the application', async () => {
    await expect(generate()).resolves.toBe(TOKEN_PAIR);

    expect(
      applicationTokenService.generateApplicationTokenPair,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION.id,
      userId: USER_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });
    expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
      where: { userId: USER_ID, workspaceId: WORKSPACE_ID },
    });
  });

  it('should let a token issued for a user re-issue itself for that same user', async () => {
    await expect(
      generate({
        requestUserWorkspaceId: USER_WORKSPACE_ID,
        requestWorkspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).resolves.toBe(TOKEN_PAIR);
  });

  it('should refuse a token issued for a user asking for another member', async () => {
    await expect(
      generate({
        requestUserWorkspaceId: 'other-user-workspace-id',
        requestWorkspaceMemberId: 'other-member-id',
      }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });

    expect(
      applicationTokenService.generateApplicationTokenPair,
    ).not.toHaveBeenCalled();
  });

  it('should refuse an unknown member', async () => {
    await expect(
      generate({ workspaceMemberId: 'unknown-member-id' }),
    ).rejects.toMatchObject({
      code: ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
    });
  });

  it('should refuse a deleted member', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatWorkspaceMemberMaps: {
        byId: {
          [WORKSPACE_MEMBER_ID]: {
            id: WORKSPACE_MEMBER_ID,
            userId: USER_ID,
            deletedAt: new Date().toISOString(),
          },
        },
        idByUserId: {},
      },
    });

    await expect(generate()).rejects.toBeInstanceOf(ApplicationException);
    expect(
      applicationTokenService.generateApplicationTokenPair,
    ).not.toHaveBeenCalled();
  });

  it('should refuse a member whose user no longer belongs to the workspace', async () => {
    userWorkspaceRepository.findOne.mockResolvedValue(null);

    await expect(generate()).rejects.toMatchObject({
      code: ApplicationExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
    });
  });
});
