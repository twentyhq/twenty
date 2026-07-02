import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { InternalWorkspaceMemberProvisioningService } from 'src/engine/core-modules/workspace/internal/internal-workspace-member-provisioning.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const uniqueViolation = (constraint: string) =>
  new QueryFailedError('INSERT', [], {
    code: '23505',
    constraint,
  });

type StoredUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
};

type StoredUserWorkspace = {
  id: string;
  userId: string;
  workspaceId: string;
};

type StoredWorkspaceMember = {
  id: string;
  userId: string;
  userEmail: string;
  name: {
    firstName: string;
    lastName: string;
  };
};

const makeServiceHarness = () => {
  const users = new Map<string, StoredUser>();
  const userWorkspaces = new Map<string, StoredUserWorkspace>();
  const workspaceMembers = new Map<string, StoredWorkspaceMember>();

  let userSequence = 0;
  let userWorkspaceSequence = 0;
  let workspaceMemberSequence = 0;

  const workspaceRepository = {
    findOneBy: jest.fn(async ({ id }: { id: string }) =>
      id === WORKSPACE_ID ? { id: WORKSPACE_ID } : null,
    ),
  };

  const userRepository = {
    findOne: jest.fn(
      async ({ where: { email } }: { where: { email: string } }) =>
        users.get(email) ?? null,
    ),
    create: jest.fn((user: Omit<StoredUser, 'id'>) => user),
    save: jest.fn(async (user: Omit<StoredUser, 'id'>) => {
      await Promise.resolve();

      if (users.has(user.email)) {
        throw uniqueViolation('UQ_USER_EMAIL');
      }

      const savedUser = {
        ...user,
        id: `user-${++userSequence}`,
      };

      users.set(savedUser.email, savedUser);

      return savedUser;
    }),
  };

  const userWorkspaceRepository = {
    findOne: jest.fn(
      async ({
        where: { userId, workspaceId },
      }: {
        where: { userId: string; workspaceId: string };
      }) => userWorkspaces.get(`${userId}:${workspaceId}`) ?? null,
    ),
    create: jest.fn((userWorkspace: Omit<StoredUserWorkspace, 'id'>) => ({
      ...userWorkspace,
    })),
    save: jest.fn(async (userWorkspace: Omit<StoredUserWorkspace, 'id'>) => {
      await Promise.resolve();

      const key = `${userWorkspace.userId}:${userWorkspace.workspaceId}`;

      if (userWorkspaces.has(key)) {
        throw uniqueViolation('IDX_USER_WORKSPACE_USER_ID_WORKSPACE_ID_UNIQUE');
      }

      const savedUserWorkspace = {
        ...userWorkspace,
        id: `user-workspace-${++userWorkspaceSequence}`,
      };

      userWorkspaces.set(key, savedUserWorkspace);

      return savedUserWorkspace;
    }),
  };

  const workspaceMemberRepository = {
    findOne: jest.fn(
      async ({ where }: { where: { userEmail?: string; userId?: string } }) => {
        if (where.userEmail !== undefined) {
          return workspaceMembers.get(where.userEmail) ?? null;
        }

        if (where.userId !== undefined) {
          return (
            Array.from(workspaceMembers.values()).find(
              (member) => member.userId === where.userId,
            ) ?? null
          );
        }

        return null;
      },
    ),
    insert: jest.fn(
      async (
        workspaceMember: Omit<StoredWorkspaceMember, 'id'> & {
          colorScheme: string;
          locale: string;
          avatarUrl: string | null;
        },
      ) => {
        await Promise.resolve();

        if (workspaceMembers.has(workspaceMember.userEmail)) {
          throw uniqueViolation('IDX_WORKSPACE_MEMBER_USER_EMAIL_UNIQUE');
        }

        const savedWorkspaceMember = {
          id: `workspace-member-${++workspaceMemberSequence}`,
          userId: workspaceMember.userId,
          userEmail: workspaceMember.userEmail,
          name: workspaceMember.name,
        };

        workspaceMembers.set(
          savedWorkspaceMember.userEmail,
          savedWorkspaceMember,
        );

        return { identifiers: [{ id: savedWorkspaceMember.id }] };
      },
    ),
  };

  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(
      async (callback: () => Promise<StoredWorkspaceMember>) =>
        await callback(),
    ),
    getRepository: jest.fn(async () => workspaceMemberRepository),
  };

  const service = new InternalWorkspaceMemberProvisioningService(
    workspaceRepository as never,
    userRepository as never,
    userWorkspaceRepository as never,
    globalWorkspaceOrmManager as never,
  );

  return {
    globalWorkspaceOrmManager,
    service,
    stores: {
      users,
      userWorkspaces,
      workspaceMembers,
    },
    repositories: {
      userRepository,
      userWorkspaceRepository,
      workspaceMemberRepository,
      workspaceRepository,
    },
  };
};

describe('InternalWorkspaceMemberProvisioningService', () => {
  it('creates a core user and workspace member for a new normalized email', async () => {
    const { repositories, service, stores } = makeServiceHarness();

    const result = await service.provisionWorkspaceMember({
      workspaceId: WORKSPACE_ID,
      id: 'workos-user-1',
      email: '  ADA@Example.COM ',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(result).toEqual({
      workspaceMemberId: 'workspace-member-1',
      userId: 'user-1',
      appUserId: 'workos-user-1',
      workspaceId: WORKSPACE_ID,
    });
    expect(stores.users.get('ada@example.com')).toMatchObject({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      isEmailVerified: true,
    });
    expect(repositories.userRepository.create).toHaveBeenCalledWith({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      isEmailVerified: true,
    });
    expect(JSON.stringify(Array.from(stores.users.values()))).not.toContain(
      'workos-user-1',
    );
  });

  it('reuses an existing core user when email already exists', async () => {
    const { service, stores } = makeServiceHarness();

    stores.users.set('ada@example.com', {
      id: 'existing-user-id',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      isEmailVerified: true,
    });

    const result = await service.provisionWorkspaceMember({
      workspaceId: WORKSPACE_ID,
      id: 'workos-user-2',
      email: 'ada@example.com',
      firstName: null,
      lastName: null,
    });

    expect(result.userId).toBe('existing-user-id');
    expect(stores.users.size).toBe(1);
    expect(stores.workspaceMembers.get('ada@example.com')).toMatchObject({
      userId: 'existing-user-id',
      userEmail: 'ada@example.com',
    });
  });

  it('reuses a workspace member when one already exists', async () => {
    const { service, stores } = makeServiceHarness();

    stores.users.set('ada@example.com', {
      id: 'user-1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      isEmailVerified: true,
    });
    stores.userWorkspaces.set(`user-1:${WORKSPACE_ID}`, {
      id: 'user-workspace-1',
      userId: 'user-1',
      workspaceId: WORKSPACE_ID,
    });
    stores.workspaceMembers.set('ada@example.com', {
      id: 'workspace-member-existing',
      userId: 'user-1',
      userEmail: 'ada@example.com',
      name: { firstName: 'Ada', lastName: 'Lovelace' },
    });

    const result = await service.provisionWorkspaceMember({
      workspaceId: WORKSPACE_ID,
      id: 'workos-user-3',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(result.workspaceMemberId).toBe('workspace-member-existing');
    expect(stores.workspaceMembers.size).toBe(1);
  });

  it('returns the same workspace member for repeated identical requests', async () => {
    const { service, stores } = makeServiceHarness();
    const request = {
      workspaceId: WORKSPACE_ID,
      id: 'workos-user-4',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    const firstResult = await service.provisionWorkspaceMember(request);
    const secondResult = await service.provisionWorkspaceMember(request);

    expect(secondResult).toEqual(firstResult);
    expect(stores.users.size).toBe(1);
    expect(stores.userWorkspaces.size).toBe(1);
    expect(stores.workspaceMembers.size).toBe(1);
  });

  it('converges concurrent requests for the same workspace and email to one member', async () => {
    const { service, stores } = makeServiceHarness();
    const request = {
      workspaceId: WORKSPACE_ID,
      id: 'workos-user-5',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    const results = await Promise.all([
      service.provisionWorkspaceMember(request),
      service.provisionWorkspaceMember(request),
    ]);

    expect(results[0]).toEqual(results[1]);
    expect(stores.users.size).toBe(1);
    expect(stores.userWorkspaces.size).toBe(1);
    expect(stores.workspaceMembers.size).toBe(1);
  });

  it('throws not found when the workspace does not exist', async () => {
    const { service } = makeServiceHarness();

    await expect(
      service.provisionWorkspaceMember({
        workspaceId: '20202020-0000-4000-8000-000000000404',
        id: 'workos-user-6',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws bad request when the email is invalid', async () => {
    const { service } = makeServiceHarness();

    await expect(
      service.provisionWorkspaceMember({
        workspaceId: WORKSPACE_ID,
        id: 'workos-user-8',
        email: 'not-an-email',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws conflict when an existing member belongs to a different core user', async () => {
    const { service, stores } = makeServiceHarness();

    stores.users.set('ada@example.com', {
      id: 'user-1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      isEmailVerified: true,
    });
    stores.workspaceMembers.set('ada@example.com', {
      id: 'workspace-member-conflict',
      userId: 'other-user-id',
      userEmail: 'ada@example.com',
      name: { firstName: 'Ada', lastName: 'Lovelace' },
    });

    await expect(
      service.provisionWorkspaceMember({
        workspaceId: WORKSPACE_ID,
        id: 'workos-user-7',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
