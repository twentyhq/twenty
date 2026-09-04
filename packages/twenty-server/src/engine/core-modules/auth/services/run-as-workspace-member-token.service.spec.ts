import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { RunAsWorkspaceMemberTokenService } from 'src/engine/core-modules/auth/services/run-as-workspace-member-token.service';
import { ApplicationTokenService } from 'src/engine/core-modules/auth/token/services/application-token.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000002';
const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000003';
const USER_ID = '20202020-0000-0000-0000-000000000004';
const USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000005';

describe('RunAsWorkspaceMemberTokenService', () => {
  let service: RunAsWorkspaceMemberTokenService;
  let userWorkspaceService: {
    getWorkspaceMember: jest.Mock;
    getUserWorkspaceForUser: jest.Mock;
  };
  let applicationTokenService: { generateApplicationAccessToken: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RunAsWorkspaceMemberTokenService,
        {
          provide: UserWorkspaceService,
          useValue: {
            getWorkspaceMember: jest.fn(),
            getUserWorkspaceForUser: jest.fn(),
          },
        },
        {
          provide: ApplicationTokenService,
          useValue: {
            generateApplicationAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RunAsWorkspaceMemberTokenService);
    userWorkspaceService = module.get(UserWorkspaceService);
    applicationTokenService = module.get(ApplicationTokenService);
  });

  it('should issue a token bound to both the application and the member', async () => {
    userWorkspaceService.getWorkspaceMember.mockResolvedValue({
      id: WORKSPACE_MEMBER_ID,
      userId: USER_ID,
    });
    userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue({
      id: USER_WORKSPACE_ID,
    });
    applicationTokenService.generateApplicationAccessToken.mockResolvedValue({
      token: 'token',
      expiresAt: new Date(),
    });

    const result = await service.generateAccessToken({
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      requestWorkspaceMemberId: null,
    });

    expect(result.token).toBe('token');
    expect(
      applicationTokenService.generateApplicationAccessToken,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      userId: USER_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });
  });

  it('should refuse to act as another member when the caller token is already delegated', async () => {
    await expect(
      service.generateAccessToken({
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        requestWorkspaceMemberId: '20202020-0000-0000-0000-000000000009',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(userWorkspaceService.getWorkspaceMember).not.toHaveBeenCalled();
  });

  it('should throw when the workspace member does not exist', async () => {
    userWorkspaceService.getWorkspaceMember.mockResolvedValue(null);

    await expect(
      service.generateAccessToken({
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        requestWorkspaceMemberId: null,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw when the workspace member has no user workspace', async () => {
    userWorkspaceService.getWorkspaceMember.mockResolvedValue({
      id: WORKSPACE_MEMBER_ID,
      userId: USER_ID,
    });
    userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

    await expect(
      service.generateAccessToken({
        applicationId: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        workspaceMemberId: WORKSPACE_MEMBER_ID,
        requestWorkspaceMemberId: null,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
