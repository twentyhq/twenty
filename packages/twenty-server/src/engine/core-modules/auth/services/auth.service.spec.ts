import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { expect, jest } from '@jest/globals';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { RefreshTokenService } from 'src/engine/core-modules/auth/token/services/refresh-token.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { SocialSsoService } from 'src/engine/core-modules/auth/services/social-sso.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { AuthService } from './auth.service';

jest.mock('bcrypt');

const UserFindOneMock = jest.fn();
const UserWorkspaceFindOneByMock = jest.fn();

const userWorkspaceServiceCheckUserWorkspaceExistsMock = jest.fn();
const workspaceInvitationGetOneWorkspaceInvitationMock = jest.fn();
const workspaceInvitationValidateInvitationMock = jest.fn();
const userWorkspaceAddUserToWorkspaceMock = jest.fn();

const environmentServiceGetMock = jest.fn();

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {
            findOne: UserFindOneMock,
          },
        },
        {
          provide: getRepositoryToken(AppToken, 'core'),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockImplementation(() => null),
            }),
          },
        },
        {
          provide: SignInUpService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: environmentServiceGetMock,
          },
        },
        {
          provide: DomainManagerService,
          useValue: {},
        },
        {
          provide: EmailService,
          useValue: {},
        },
        {
          provide: AccessTokenService,
          useValue: {},
        },
        {
          provide: RefreshTokenService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {
            checkUserWorkspaceExists:
              userWorkspaceServiceCheckUserWorkspaceExistsMock,
            addUserToWorkspace: userWorkspaceAddUserToWorkspaceMock,
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: WorkspaceInvitationService,
          useValue: {
            getOneWorkspaceInvitation:
              workspaceInvitationGetOneWorkspaceInvitationMock,
            validateInvitation: workspaceInvitationValidateInvitationMock,
          },
        },
        {
          provide: SocialSsoService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    environmentServiceGetMock.mockReturnValue(false);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('challenge - user already member of workspace', async () => {
    const workspace = { isPasswordAuthEnabled: true } as Workspace;
    const user = {
      email: 'email',
      password: 'password',
      captchaToken: 'captchaToken',
    };

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);

    UserFindOneMock.mockReturnValueOnce({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    UserWorkspaceFindOneByMock.mockReturnValueOnce({});

    userWorkspaceServiceCheckUserWorkspaceExistsMock.mockReturnValueOnce({});

    const response = await service.challenge(
      {
        email: 'email',
        password: 'password',
        captchaToken: 'captchaToken',
      },
      workspace,
    );

    expect(response).toStrictEqual({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });
  });

  it('challenge - user who have an invitation', async () => {
    const user = {
      email: 'email',
      password: 'password',
      captchaToken: 'captchaToken',
    };

    UserFindOneMock.mockReturnValueOnce({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    (bcrypt.compare as jest.Mock).mockReturnValueOnce(true);
    userWorkspaceServiceCheckUserWorkspaceExistsMock.mockReturnValueOnce(false);

    workspaceInvitationGetOneWorkspaceInvitationMock.mockReturnValueOnce({});
    workspaceInvitationValidateInvitationMock.mockReturnValueOnce({});
    userWorkspaceAddUserToWorkspaceMock.mockReturnValueOnce({});

    const response = await service.challenge(
      {
        email: 'email',
        password: 'password',
        captchaToken: 'captchaToken',
      },
      {
        isPasswordAuthEnabled: true,
      } as Workspace,
    );

    expect(response).toStrictEqual({
      email: user.email,
      passwordHash: 'passwordHash',
      captchaToken: user.captchaToken,
    });

    expect(
      workspaceInvitationGetOneWorkspaceInvitationMock,
    ).toHaveBeenCalledTimes(1);
    expect(workspaceInvitationValidateInvitationMock).toHaveBeenCalledTimes(1);
    expect(userWorkspaceAddUserToWorkspaceMock).toHaveBeenCalledTimes(1);
    expect(UserFindOneMock).toHaveBeenCalledTimes(1);
  });
});
