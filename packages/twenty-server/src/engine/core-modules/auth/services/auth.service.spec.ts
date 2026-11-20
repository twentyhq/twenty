import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { assertUserPasswordIsValidOrThrow } from 'src/engine/core-modules/auth/utils/assert-user-password-is-valid-or-throw.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock(
  'src/engine/core-modules/auth/utils/assert-user-password-is-valid-or-throw.util',
);

const user = Object.assign(new UserEntity(), {
  id: '20202020-0000-4000-8000-000000000001',
  email: 'tim@apple.dev',
  isEmailVerified: true,
});

const workspace = Object.assign(new WorkspaceEntity(), {
  id: '20202020-0000-4000-8000-000000000002',
  isPasswordAuthEnabled: true,
});

const buildService = async () => {
  const addUserToWorkspaceIfUserNotInWorkspace = jest.fn();

  const module = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UserWorkspaceService,
        useValue: {
          checkUserWorkspaceExists: async () => new UserWorkspaceEntity(),
          addUserToWorkspaceIfUserNotInWorkspace,
        },
      },
      {
        provide: getRepositoryToken(UserEntity),
        useValue: { findOne: async () => user },
      },
      {
        provide: TwentyConfigService,
        useValue: { get: () => false },
      },
    ],
  })
    .useMocker(() => ({}))
    .compile();

  return {
    service: module.get(AuthService),
    addUserToWorkspaceIfUserNotInWorkspace,
  };
};

describe('AuthService.validateLoginWithPasswordAndJoinWorkspaceIfInvited', () => {
  it('should let an existing member finish an interrupted membership setup', async () => {
    const { service, addUserToWorkspaceIfUserNotInWorkspace } =
      await buildService();

    await expect(
      service.validateLoginWithPasswordAndJoinWorkspaceIfInvited(
        { email: user.email, password: 'password' },
        workspace,
      ),
    ).resolves.toBe(user);

    expect(addUserToWorkspaceIfUserNotInWorkspace).toHaveBeenCalledWith(
      user,
      workspace,
    );
  });

  it('should not touch the membership when the password is wrong', async () => {
    jest
      .mocked(assertUserPasswordIsValidOrThrow)
      .mockRejectedValueOnce(new Error('Wrong password'));

    const { service, addUserToWorkspaceIfUserNotInWorkspace } =
      await buildService();

    await expect(
      service.validateLoginWithPasswordAndJoinWorkspaceIfInvited(
        { email: user.email, password: 'wrong' },
        workspace,
      ),
    ).rejects.toThrow('Wrong password');

    expect(addUserToWorkspaceIfUserNotInWorkspace).not.toHaveBeenCalled();
  });
});
