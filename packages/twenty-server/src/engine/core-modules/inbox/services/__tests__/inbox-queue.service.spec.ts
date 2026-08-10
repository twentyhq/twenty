import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const QUEUE_ID = 'queue-id';
const TRIAGE_QUEUE_ID = 'triage-queue-id';
const ROLE_ID = 'role-id';
const OTHER_ROLE_ID = 'other-role-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

describe('InboxQueueService', () => {
  let service: InboxQueueService;

  const inboxQueueRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const inboxQueueRoleRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    saveMany: jest.Mock;
    delete: jest.Mock;
    withManager: jest.Mock;
  } = {
    find: jest.fn(),
    findOne: jest.fn(),
    saveMany: jest.fn(),
    delete: jest.fn(),
    // Grant replacement runs in a transaction, which rebinds the repository to
    // that transaction's manager
    withManager: jest.fn(() => inboxQueueRoleRepository),
  };
  const inboxItemRepository = { update: jest.fn() };
  const roleRepository = { find: jest.fn() };
  const userRoleService = { getRoleIdForUserWorkspace: jest.fn() };
  const queueLockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
  };
  const coreDataSource = {
    transaction: jest.fn((run: (manager: unknown) => unknown) =>
      run({ createQueryBuilder: () => queueLockQueryBuilder }),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inboxQueueRepository.find.mockResolvedValue([]);
    inboxQueueRepository.findOne.mockResolvedValue({
      id: QUEUE_ID,
      name: 'Support',
      slug: 'support',
      isDefault: false,
    });
    inboxQueueRepository.save.mockImplementation((_workspaceId, queue) => ({
      id: QUEUE_ID,
      ...queue,
    }));
    inboxQueueRoleRepository.find.mockResolvedValue([]);
    inboxQueueRoleRepository.findOne.mockResolvedValue(null);
    userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(ROLE_ID);
    roleRepository.find.mockResolvedValue([
      { id: ROLE_ID },
      { id: OTHER_ROLE_ID },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxQueueService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxQueueEntity),
          useValue: inboxQueueRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxQueueRoleEntity),
          useValue: inboxQueueRoleRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleEntity),
          useValue: roleRepository,
        },
        {
          provide: UserRoleService,
          useValue: userRoleService,
        },
        {
          provide: getDataSourceToken(),
          useValue: coreDataSource,
        },
      ],
    }).compile();

    service = module.get<InboxQueueService>(InboxQueueService);
  });

  describe('createQueue', () => {
    it('should derive an address from the name', async () => {
      // Act
      await service.createQueue({
        workspaceId: WORKSPACE_ID,
        name: 'Customer Support',
        roleIds: [],
      });

      // Assert
      expect(inboxQueueRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slug: 'customer-support', isDefault: false }),
      );
    });

    // Two teams can both call their inbox "Support"; they cannot both own /q/support
    it('should not reuse an address another queue already holds', async () => {
      // Prepare
      inboxQueueRepository.find.mockResolvedValue([
        { slug: 'support' },
        { slug: 'support-2' },
      ]);

      // Act
      await service.createQueue({
        workspaceId: WORKSPACE_ID,
        name: 'Support',
        roleIds: [],
      });

      // Assert
      expect(inboxQueueRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slug: 'support-3' }),
      );
    });

    it('should still find an address for a name that slugifies to nothing', async () => {
      // Act
      await service.createQueue({
        workspaceId: WORKSPACE_ID,
        name: '🚀',
        roleIds: [],
      });

      // Assert
      expect(inboxQueueRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slug: 'inbox' }),
      );
    });
  });

  describe('setQueueRoles', () => {
    // Saving the list replaces it, so the roles dropped from it lose access
    it('should replace the grants rather than add to them', async () => {
      // Act
      await service.setQueueRoles({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
        roleIds: [ROLE_ID, OTHER_ROLE_ID],
      });

      // Assert
      expect(inboxQueueRoleRepository.delete).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { queueId: QUEUE_ID },
      );
      expect(inboxQueueRoleRepository.saveMany).toHaveBeenCalledWith(
        WORKSPACE_ID,
        [
          { queueId: QUEUE_ID, roleId: ROLE_ID },
          { queueId: QUEUE_ID, roleId: OTHER_ROLE_ID },
        ],
      );
    });

    // A role from another workspace satisfies the foreign key, so the workspace
    // predicate is the only thing keeping the grant out
    it('should refuse a role that does not belong to this workspace', async () => {
      // Prepare
      roleRepository.find.mockResolvedValue([]);

      // Act & Assert
      await expect(
        service.setQueueRoles({
          workspaceId: WORKSPACE_ID,
          queueId: QUEUE_ID,
          roleIds: ['someone-elses-role-id'],
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.UNKNOWN_INBOX_ROLE,
      });
      expect(inboxQueueRoleRepository.saveMany).not.toHaveBeenCalled();
    });

    it('should leave nobody with access when the list is emptied', async () => {
      // Act
      await service.setQueueRoles({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
        roleIds: [],
      });

      // Assert
      expect(inboxQueueRoleRepository.delete).toHaveBeenCalled();
      expect(inboxQueueRoleRepository.saveMany).not.toHaveBeenCalled();
    });
  });

  describe('findAccessibleQueueIds', () => {
    // Access is a permission, so it is read off the role rather than a list
    it('should return the queues granted to the role of the person asking', async () => {
      // Prepare
      inboxQueueRoleRepository.find.mockResolvedValue([
        { queueId: QUEUE_ID, roleId: ROLE_ID },
        { queueId: TRIAGE_QUEUE_ID, roleId: ROLE_ID },
      ]);

      // Act
      const queueIds = await service.findAccessibleQueueIds({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      });

      // Assert
      expect(inboxQueueRoleRepository.find).toHaveBeenCalledWith(WORKSPACE_ID, {
        where: { roleId: ROLE_ID },
      });
      expect(queueIds).toEqual([QUEUE_ID, TRIAGE_QUEUE_ID]);
    });

    it('should return nothing when the role has no shared inbox', async () => {
      // Act
      const queueIds = await service.findAccessibleQueueIds({
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
      });

      // Assert
      expect(queueIds).toEqual([]);
    });
  });

  describe('deleteQueue', () => {
    // The delete cascades to items, so the work has to leave first
    it('should move the work to triage rather than delete it', async () => {
      // Prepare
      inboxQueueRepository.findOne
        .mockResolvedValueOnce({ id: QUEUE_ID, isDefault: false })
        .mockResolvedValueOnce({ id: TRIAGE_QUEUE_ID, isDefault: true });

      // Act
      await service.deleteQueue({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
      });

      // Assert
      expect(inboxItemRepository.update).toHaveBeenCalledWith(
        WORKSPACE_ID,
        { queueId: QUEUE_ID },
        { queueId: TRIAGE_QUEUE_ID, slotKey: null },
      );
      expect(inboxQueueRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
        id: QUEUE_ID,
      });
    });

    it('should refuse to delete the queue that catches unaddressed work', async () => {
      // Prepare
      inboxQueueRepository.findOne.mockResolvedValue({
        id: TRIAGE_QUEUE_ID,
        isDefault: true,
      });

      // Act & Assert
      await expect(
        service.deleteQueue({
          workspaceId: WORKSPACE_ID,
          queueId: TRIAGE_QUEUE_ID,
        }),
      ).rejects.toMatchObject({
        code: InboxExceptionCode.INVALID_INBOX_QUEUE_CHANGE,
      });
      expect(inboxQueueRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateQueue', () => {
    // The slug is in every link to the queue, so renaming must not move it
    it('should leave the address alone when the name changes', async () => {
      // Act
      await service.updateQueue({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
        name: 'Customer Support',
      });

      // Assert
      const [, , partialUpdate] = inboxQueueRepository.update.mock.calls[0];

      expect(partialUpdate).toEqual({ name: 'Customer Support' });
    });
  });
});
