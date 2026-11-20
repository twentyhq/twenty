import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { assertUserPasswordIsValidOrThrow } from 'src/engine/core-modules/auth/utils/assert-user-password-is-valid-or-throw.util';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock(
  'src/engine/core-modules/auth/utils/assert-user-password-is-valid-or-throw.util',
);

const user = {
  id: '20202020-0000-4000-8000-000000000001',
  email: 'tim@apple.dev',
  isEmailVerified: true,
} as UserEntity;

const workspace = {
  id: '20202020-0000-4000-8000-000000000002',
  isPasswordAuthEnabled: true,
} as WorkspaceEntity;

const buildService = () => {
  const addUserToWorkspaceIfUserNotInWorkspace = jest.fn();

  const userWorkspaceService = {
    checkUserWorkspaceExists: async () => ({}) as UserWorkspaceEntity,
    addUserToWorkspaceIfUserNotInWorkspace,
  };

  const constructorArguments: unknown[] = new Array(24).fill({});

  constructorArguments[7] = userWorkspaceService;
  constructorArguments[14] = { findOne: async () => user };
  constructorArguments[15] = { get: () => false };

  const service = new AuthService(
    ...(constructorArguments as ConstructorParameters<typeof AuthService>),
  );

  return { service, addUserToWorkspaceIfUserNotInWorkspace };
};

describe('AuthService.validateLoginWithPasswordAndJoinWorkspaceIfInvited', () => {
  it('should let an existing member finish an interrupted membership setup', async () => {
    const { service, addUserToWorkspaceIfUserNotInWorkspace } = buildService();

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

    const { service, addUserToWorkspaceIfUserNotInWorkspace } = buildService();

    await expect(
      service.validateLoginWithPasswordAndJoinWorkspaceIfInvited(
        { email: user.email, password: 'wrong' },
        workspace,
      ),
    ).rejects.toThrow('Wrong password');

    expect(addUserToWorkspaceIfUserNotInWorkspace).not.toHaveBeenCalled();
  });
});
