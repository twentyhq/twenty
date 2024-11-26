import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import bcrypt from 'bcrypt';
import { expect, jest } from '@jest/globals';

import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';

jest.mock('bcrypt');

const UserFindOneMock = jest.fn();
const workspaceInvitationValidateInvitationMock = jest.fn();
const workspaceInvitationInvalidateWorkspaceInvitationMock = jest.fn();
const workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock =
  jest.fn();
const userWorkspaceServiceAddUserToWorkspaceMock = jest.fn();
const UserCreateMock = jest.fn();
const UserSaveMock = jest.fn();

describe('SignInUpService', () => {
  let service: SignInUpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: FileUploadService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
            create: UserCreateMock,
            save: UserSaveMock,
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            addUserToWorkspace: userWorkspaceServiceAddUserToWorkspaceMock,
          },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingConnectAccountPending: jest.fn(),
            setOnboardingCreateProfilePending: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {},
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            validateInvitation: workspaceInvitationValidateInvitationMock,
            invalidateWorkspaceInvitation:
              workspaceInvitationInvalidateWorkspaceInvitationMock,
            findInvitationByWorkspaceSubdomainAndUserEmail:
              workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock,
          },
        },
      ],
    }).compile();

    service = module.get<SignInUpService>(SignInUpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signInUp - sso - new user', async () => {
    const email = 'test@test.com';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      undefined,
    );

    const spy = jest
      .spyOn(service, 'signUpOnNewWorkspace')
      .mockResolvedValueOnce({} as User);

    await service.signInUp({
      email: 'test@test.com',
      fromSSO: true,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        email,
        passwordHash: undefined,
        firstName: expect.any(String),
        lastName: expect.any(String),
        picture: undefined,
      }),
    );
  });
  it('signInUp - sso - existing user', async () => {
    const email = 'existing@test.com';
    const existingUser = {
      id: 'user-id',
      email,
      passwordHash: undefined,
      defaultWorkspace: { id: 'workspace-id' },
    };

    UserFindOneMock.mockReturnValueOnce(existingUser);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      undefined,
    );

    const result = await service.signInUp({
      email,
      fromSSO: true,
    });

    expect(result).toEqual(existingUser);
  });
  it.skip('signInUp - sso - new user - existing invitation', async () => {
    const email = 'newuser@test.com';
    const workspaceId = 'workspace-id';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      {
        value: 'personal-token-value',
      },
    );
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: { id: workspaceId },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    const spySignInUpOnExistingWorkspace = jest
      .spyOn(service, 'signInUpOnExistingWorkspace')
      .mockResolvedValueOnce(
        {} as Awaited<
          ReturnType<(typeof service)['signInUpOnExistingWorkspace']>
        >,
      );

    await service.signInUp({
      email,
      fromSSO: true,
    });

    expect(spySignInUpOnExistingWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        email,
        passwordHash: undefined,
        workspace: expect.objectContaining({
          id: workspaceId,
        }),
        firstName: expect.any(String),
        lastName: expect.any(String),
        picture: undefined,
      }),
    );

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it.skip('signInUp - sso - existing user - existing invitation', async () => {
    const email = 'existinguser@test.com';
    const workspaceId = 'workspace-id';
    const existingUser = {
      id: 'user-id',
      email,
      passwordHash: undefined,
      defaultWorkspace: { id: 'workspace-id' },
    };

    UserFindOneMock.mockReturnValueOnce(existingUser);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      {
        value: 'personal-token-value',
      },
    );
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    userWorkspaceServiceAddUserToWorkspaceMock.mockReturnValueOnce({});

    const result = await service.signInUp({
      email,
      fromSSO: true,
    });

    expect(result).toEqual(existingUser);
    expect(userWorkspaceServiceAddUserToWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it('signInUp - sso - new user - personal invitation token', async () => {
    const email = 'newuser@test.com';
    const workspaceId = 'workspace-id';
    const workspacePersonalInviteToken = 'personal-token-value';

    UserFindOneMock.mockReturnValueOnce(null);

    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    const spySignInUpOnExistingWorkspace = jest
      .spyOn(service, 'signInUpOnExistingWorkspace')
      .mockResolvedValueOnce(
        {} as Awaited<
          ReturnType<(typeof service)['signInUpOnExistingWorkspace']>
        >,
      );

    await service.signInUp({
      email,
      fromSSO: true,
      workspacePersonalInviteToken,
    });

    expect(spySignInUpOnExistingWorkspace).toHaveBeenCalledWith(
      expect.objectContaining({
        email,
        passwordHash: undefined,
        workspace: expect.objectContaining({
          id: workspaceId,
        }),
        firstName: expect.any(String),
        lastName: expect.any(String),
        picture: undefined,
      }),
    );

    expect(
      workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock,
    ).not.toHaveBeenCalled();
    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it('signInUp - sso - existing user - personal invitation token', async () => {
    const email = 'existinguser@test.com';
    const workspaceId = 'workspace-id';
    const workspacePersonalInviteToken = 'personal-token-value';
    const existingUser = {
      id: 'user-id',
      email,
      passwordHash: undefined,
      defaultWorkspace: { id: 'workspace-id' },
    };

    UserFindOneMock.mockReturnValueOnce(existingUser);
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    await service.signInUp({
      email,
      fromSSO: true,
      workspacePersonalInviteToken,
    });

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it.skip('signInUp - credentials - existing user - invitation', async () => {
    const email = 'existinguser@test.com';
    const password = 'validPassword123';
    const workspaceId = 'workspace-id';
    const existingUser = {
      id: 'user-id',
      email,
      passwordHash: 'hash-of-validPassword123',
      defaultWorkspace: { id: 'workspace-id' },
    };

    UserFindOneMock.mockReturnValueOnce(existingUser);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      {
        value: 'personal-token-value',
      },
    );
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);

    await service.signInUp({
      email,
      password,
      fromSSO: false,
    });

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it.skip('signInUp - credentials - new user - invitation', async () => {
    const email = 'newuser@test.com';
    const password = 'validPassword123';
    const workspaceId = 'workspace-id';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationFindInvitationByWorkspaceSubdomainAndUserEmailMock.mockReturnValueOnce(
      {
        value: 'personal-token-value',
      },
    );
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    UserCreateMock.mockReturnValueOnce({} as User);
    UserSaveMock.mockReturnValueOnce({} as User);

    await service.signInUp({
      email,
      password,
      fromSSO: false,
    });

    expect(UserCreateMock).toHaveBeenCalledTimes(1);
    expect(UserSaveMock).toHaveBeenCalledTimes(1);

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it('signInUp - credentials - new user - personal invitation token', async () => {
    const email = 'newuser@test.com';
    const password = 'validPassword123';
    const workspaceId = 'workspace-id';
    const workspacePersonalInviteToken = 'personal-token-value';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    UserCreateMock.mockReturnValueOnce({} as User);
    UserSaveMock.mockReturnValueOnce({} as User);

    await service.signInUp({
      email,
      password,
      fromSSO: false,
      workspacePersonalInviteToken,
    });

    expect(UserCreateMock).toHaveBeenCalledTimes(1);
    expect(UserSaveMock).toHaveBeenCalledTimes(1);

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
  it('signInUp - credentials - new user - public invitation token', async () => {
    const email = 'newuser@test.com';
    const password = 'validPassword123';
    const workspaceId = 'workspace-id';
    const workspaceInviteHash = 'public-token-value';

    UserFindOneMock.mockReturnValueOnce(null);
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({
      isValid: true,
      workspace: {
        id: workspaceId,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    workspaceInvitationInvalidateWorkspaceInvitationMock.mockReturnValueOnce(
      true,
    );

    UserCreateMock.mockReturnValueOnce({} as User);
    UserSaveMock.mockReturnValueOnce({} as User);

    await service.signInUp({
      email,
      password,
      fromSSO: false,
      workspaceInviteHash,
    });

    expect(UserCreateMock).toHaveBeenCalledTimes(1);
    expect(UserSaveMock).toHaveBeenCalledTimes(1);

    expect(
      workspaceInvitationInvalidateWorkspaceInvitationMock,
    ).toHaveBeenCalledWith(workspaceId, email);
  });
});
