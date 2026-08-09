import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueMemberEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-member.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxExceptionCode } from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const WORKSPACE_ID = 'workspace-id';
const QUEUE_ID = 'queue-id';
const TRIAGE_QUEUE_ID = 'triage-queue-id';
const MEMBER_ID = 'user-workspace-id';

describe('InboxQueueService', () => {
  let service: InboxQueueService;

  const inboxQueueRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const inboxQueueMemberRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    saveMany: jest.fn(),
    delete: jest.fn(),
  };
  const inboxItemRepository = { update: jest.fn() };
  const userWorkspaceRepository = { find: jest.fn() };

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
    inboxQueueMemberRepository.find.mockResolvedValue([]);
    userWorkspaceRepository.find.mockResolvedValue([{ id: MEMBER_ID }]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InboxQueueService,
        {
          provide: getWorkspaceScopedRepositoryToken(InboxQueueEntity),
          useValue: inboxQueueRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxQueueMemberEntity),
          useValue: inboxQueueMemberRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(InboxItemEntity),
          useValue: inboxItemRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
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
        memberUserWorkspaceIds: [],
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
        memberUserWorkspaceIds: [],
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
        memberUserWorkspaceIds: [],
      });

      // Assert
      expect(inboxQueueRepository.save).toHaveBeenCalledWith(
        WORKSPACE_ID,
        expect.objectContaining({ slug: 'inbox' }),
      );
    });
  });

  describe('setMembers', () => {
    // Membership is read access, so this is an authorization boundary
    it('should drop ids that belong to another workspace', async () => {
      // Prepare
      userWorkspaceRepository.find.mockResolvedValue([{ id: MEMBER_ID }]);

      // Act
      await service.setMembers({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
        memberUserWorkspaceIds: [MEMBER_ID, 'someone-elses-user-workspace-id'],
      });

      // Assert
      expect(inboxQueueMemberRepository.saveMany).toHaveBeenCalledWith(
        WORKSPACE_ID,
        [{ queueId: QUEUE_ID, userWorkspaceId: MEMBER_ID }],
      );
    });

    it('should write nobody when none of the ids are members', async () => {
      // Prepare
      userWorkspaceRepository.find.mockResolvedValue([]);

      // Act
      await service.setMembers({
        workspaceId: WORKSPACE_ID,
        queueId: QUEUE_ID,
        memberUserWorkspaceIds: ['someone-elses-user-workspace-id'],
      });

      // Assert
      expect(inboxQueueMemberRepository.delete).toHaveBeenCalled();
      expect(inboxQueueMemberRepository.saveMany).not.toHaveBeenCalled();
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
