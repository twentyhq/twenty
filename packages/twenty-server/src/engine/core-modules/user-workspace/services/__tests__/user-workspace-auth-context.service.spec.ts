import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';

const args = { workspaceId: 'workspace', userWorkspaceId: 'membership' };
const build = () => {
  const repository = {
    findOne: jest.fn().mockResolvedValue({
      id: 'membership',
      userId: 'user',
      user: { id: 'user', createdAt: new Date(), updatedAt: new Date() },
    }),
  };
  const member = { id: 'member', deletedAt: null as Date | null };
  const cache = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatWorkspaceMemberMaps: {
        idByUserId: { user: 'member' },
        byId: { member },
      },
    }),
  };
  return {
    service: new UserWorkspaceAuthContextService(
      repository as never,
      cache as never,
    ),
    repository,
    cache,
    member,
  };
};

describe('Fresh workspace user context', () => {
  it('reloads the live membership for each authorization check', async () => {
    const { service, repository } = build();
    await expect(service.resolve(args)).resolves.toMatchObject({
      type: 'user',
      userWorkspaceId: 'membership',
      workspaceMemberId: 'member',
    });
    repository.findOne.mockResolvedValue(null);
    await expect(service.resolve(args)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'membership', workspaceId: 'workspace' },
      relations: { user: true },
    });
  });

  it('denies a soft-deleted workspace member', async () => {
    const { service, member } = build();
    member.deletedAt = new Date();
    await expect(service.resolve(args)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('denies a disabled user even while their membership remains', async () => {
    const { service, repository } = build();
    repository.findOne.mockResolvedValue({
      id: 'membership',
      userId: 'user',
      user: { id: 'user', disabled: true },
    });
    await expect(service.resolve(args)).rejects.toMatchObject({
      code: 'UNAUTHENTICATED',
    });
  });

  it('rejects missing membership identifiers before querying', async () => {
    const { service, repository } = build();
    await expect(
      service.resolve({ ...args, userWorkspaceId: '' }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('retains the request application restriction when rebuilding the same user', async () => {
    const { service } = build();
    const context = {
      type: 'user',
      workspace: { id: 'workspace' },
      userWorkspaceId: 'membership',
      application: { id: 'app', defaultRoleId: 'app-role' },
    } as UserWorkspaceAuthContext;
    await withWorkspaceAuthContext(context, async () => {
      await expect(service.resolve(args)).resolves.toMatchObject({
        application: context.application,
      });
      const anotherRecipient = await service.resolve({
        ...args,
        userWorkspaceId: 'another-recipient',
      });
      expect(anotherRecipient.application).toBeUndefined();
    });
  });
});

describe('Persisted application scope', () => {
  it('reloads the application role when executing a queued message', async () => {
    const { service, cache } = build();
    cache.getOrRecompute
      .mockResolvedValueOnce({
        flatWorkspaceMemberMaps: {
          idByUserId: { user: 'member' },
          byId: { member: { id: 'member' } },
        },
      } as never)
      .mockResolvedValueOnce({
        flatApplicationMaps: {
          byId: { app: { id: 'app', defaultRoleId: 'current-role' } },
        },
      } as never);
    await expect(
      service.resolve({ ...args, applicationId: 'app' }),
    ).resolves.toMatchObject({
      application: { id: 'app', defaultRoleId: 'current-role' },
    });
  });
  it('fails closed when the original application was removed', async () => {
    const { service, cache } = build();
    cache.getOrRecompute
      .mockResolvedValueOnce({
        flatWorkspaceMemberMaps: {
          idByUserId: { user: 'member' },
          byId: { member: { id: 'member' } },
        },
      } as never)
      .mockResolvedValueOnce({ flatApplicationMaps: { byId: {} } } as never);
    await expect(
      service.resolve({ ...args, applicationId: 'removed' }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
  it('does not inherit an ambient application when a queued sender has explicit direct access', async () => {
    const { service } = build();
    const request = {
      type: 'user',
      workspace: { id: args.workspaceId },
      userWorkspaceId: args.userWorkspaceId,
      application: { id: 'app' },
    } as UserWorkspaceAuthContext;
    await withWorkspaceAuthContext(request, async () => {
      expect(
        (await service.resolve({ ...args, applicationId: null })).application,
      ).toBeUndefined();
    });
  });
});
