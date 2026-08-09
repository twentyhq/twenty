import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import {
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { type FindOptionsWhere, In, Repository } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueMemberEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-member.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { isUniqueViolation } from 'src/engine/core-modules/inbox/utils/is-unique-violation.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_QUEUE_SLUG = 'triage';

@Injectable()
export class InboxQueueService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxQueueEntity)
    private readonly inboxQueueRepository: WorkspaceScopedRepository<InboxQueueEntity>,
    @InjectWorkspaceScopedRepository(InboxQueueMemberEntity)
    private readonly inboxQueueMemberRepository: WorkspaceScopedRepository<InboxQueueMemberEntity>,
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // The queues a person watches. This is also the set of queues whose items
  // they may read, so every read scope is built from it.
  async findMemberQueueIds({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string[]> {
    const memberships = await this.inboxQueueMemberRepository.find(
      workspaceId,
      { where: { userWorkspaceId } },
    );

    return memberships.map((membership) => membership.queueId);
  }

  async findMemberQueues({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<InboxQueueEntity[]> {
    const queueIds = await this.findMemberQueueIds({
      workspaceId,
      userWorkspaceId,
    });

    if (queueIds.length === 0) {
      return [];
    }

    return this.inboxQueueRepository.find(workspaceId, {
      where: { id: In(queueIds) },
      order: { name: 'ASC' },
    });
  }

  async findMemberQueueBySlug({
    workspaceId,
    userWorkspaceId,
    slug,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    slug: string;
  }): Promise<InboxQueueEntity | null> {
    const membership = await this.inboxQueueMemberRepository.findOne(
      workspaceId,
      {
        // The join is part of an authorization gate, so the queue carries the
        // tenant predicate rather than inheriting it from the membership row
        where: { userWorkspaceId, queue: { slug, workspaceId } },
        relations: { queue: true },
      },
    );

    return membership?.queue ?? null;
  }

  // Where work goes when no rule could address it. Created on demand rather
  // than seeded, so a workspace that never needs one never has one.
  async findOrCreateDefaultQueue({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<InboxQueueEntity> {
    const existingQueue = await this.inboxQueueRepository.findOne(workspaceId, {
      where: { isDefault: true },
    });

    if (isDefined(existingQueue)) {
      return existingQueue;
    }

    try {
      return await this.inboxQueueRepository.save(workspaceId, {
        name: 'Triage',
        slug: DEFAULT_INBOX_QUEUE_SLUG,
        icon: 'IconInbox',
        isDefault: true,
      });
    } catch (error) {
      const concurrentQueue = isUniqueViolation(error)
        ? await this.inboxQueueRepository.findOne(workspaceId, {
            where: { isDefault: true },
          })
        : null;

      if (!isDefined(concurrentQueue)) {
        throw error;
      }

      return concurrentQueue;
    }
  }

  // Administration. Everything below is settings-gated: it decides who can
  // reach which shared inbox, which is the only thing keeping one team out of
  // another's work.

  async findAllQueues({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<InboxQueueEntity[]> {
    return this.inboxQueueRepository.find(workspaceId, {
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findQueueMemberIdsByQueue({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Map<string, string[]>> {
    const memberships = await this.inboxQueueMemberRepository.find(workspaceId);

    return memberships.reduce((memberIdsByQueue, membership) => {
      const memberIds = memberIdsByQueue.get(membership.queueId) ?? [];

      memberIdsByQueue.set(membership.queueId, [
        ...memberIds,
        membership.userWorkspaceId,
      ]);

      return memberIdsByQueue;
    }, new Map<string, string[]>());
  }

  async createQueue({
    workspaceId,
    name,
    icon,
    memberWorkspaceMemberIds,
  }: {
    workspaceId: string;
    name: string;
    icon?: string | null;
    memberWorkspaceMemberIds: string[];
  }): Promise<InboxQueueEntity> {
    const queue = await this.inboxQueueRepository.save(workspaceId, {
      name,
      slug: await this.buildAvailableSlug({ workspaceId, name }),
      icon: icon ?? null,
      isDefault: false,
    });

    await this.setMembers({
      workspaceId,
      queueId: queue.id,
      memberWorkspaceMemberIds,
    });

    return queue;
  }

  // The slug is not regenerated on rename: it is in the URL of every link and
  // bookmark to the queue, so the display name moves and the address does not.
  async updateQueue({
    workspaceId,
    queueId,
    name,
    icon,
  }: {
    workspaceId: string;
    queueId: string;
    name?: string;
    icon?: string | null;
  }): Promise<InboxQueueEntity> {
    const queue = await this.findQueueOrThrow({ workspaceId, queueId });

    await this.inboxQueueRepository.update(
      workspaceId,
      { id: queue.id },
      {
        ...(isDefined(name) ? { name } : {}),
        ...(icon === undefined ? {} : { icon }),
      },
    );

    return this.findQueueOrThrow({ workspaceId, queueId });
  }

  // Deleting a queue cascades to its items, so the work moves out first. An
  // item someone already took is still theirs; it just stops being shared.
  async deleteQueue({
    workspaceId,
    queueId,
  }: {
    workspaceId: string;
    queueId: string;
  }): Promise<void> {
    const queue = await this.findQueueOrThrow({ workspaceId, queueId });

    if (queue.isDefault) {
      throw new InboxException(
        'The triage queue cannot be deleted',
        InboxExceptionCode.INVALID_INBOX_QUEUE_CHANGE,
        {
          userFriendlyMessage: msg`The triage inbox catches work nothing else claimed, so it cannot be deleted.`,
        },
      );
    }

    const defaultQueue = await this.findOrCreateDefaultQueue({ workspaceId });

    // A slot is unique per queue, so a moved item could collide with one triage
    // already holds. It gives up its slot rather than its existence: the next
    // event about the same subject opens a fresh slot wherever it now routes.
    await this.inboxItemRepository.update(
      workspaceId,
      { queueId: queue.id },
      { queueId: defaultQueue.id, slotKey: null },
    );

    await this.inboxQueueRepository.delete(workspaceId, { id: queue.id });
  }

  async setMembers({
    workspaceId,
    queueId,
    memberWorkspaceMemberIds,
  }: {
    workspaceId: string;
    queueId: string;
    memberWorkspaceMemberIds: string[];
  }): Promise<void> {
    // Membership is read access, so the translation doubles as the check: an id
    // that is not a member of this workspace resolves to nothing.
    const userWorkspaceIds = await this.toUserWorkspaceIds({
      workspaceId,
      workspaceMemberIds: memberWorkspaceMemberIds,
    });

    await this.inboxQueueMemberRepository.delete(workspaceId, { queueId });

    if (userWorkspaceIds.length === 0) {
      return;
    }

    await this.inboxQueueMemberRepository.saveMany(
      workspaceId,
      userWorkspaceIds.map((userWorkspaceId) => ({
        queueId,
        userWorkspaceId,
      })),
    );
  }

  // The inbox stores membership against the core identity, but everything that
  // administers it speaks workspace members, so the two are translated here
  // rather than leaking userWorkspaceId into the client.
  async toUserWorkspaceIds({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<string[]> {
    const userIds = await this.findUserIdsOfWorkspaceMembers({
      workspaceId,
      workspaceMemberIds,
    });

    if (userIds.length === 0) {
      return [];
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: In(userIds), workspaceId },
      select: { id: true },
    });

    return userWorkspaces.map((userWorkspace) => userWorkspace.id);
  }

  async toWorkspaceMemberIdsByUserWorkspaceId({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Map<string, string>> {
    const [userWorkspaces, workspaceMembers] = await Promise.all([
      this.userWorkspaceRepository.find({
        where: { workspaceId },
        select: { id: true, userId: true },
      }),
      this.findWorkspaceMembers({ workspaceId }),
    ]);

    const workspaceMemberIdByUserId = new Map(
      workspaceMembers.map((workspaceMember) => [
        workspaceMember.userId,
        workspaceMember.id,
      ]),
    );

    return userWorkspaces.reduce((workspaceMemberIdByUserWorkspaceId, uw) => {
      const workspaceMemberId = workspaceMemberIdByUserId.get(uw.userId);

      if (isDefined(workspaceMemberId)) {
        workspaceMemberIdByUserWorkspaceId.set(uw.id, workspaceMemberId);
      }

      return workspaceMemberIdByUserWorkspaceId;
    }, new Map<string, string>());
  }

  private async findUserIdsOfWorkspaceMembers({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<string[]> {
    const uniqueIds = [...new Set(workspaceMemberIds)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const workspaceMembers = await this.findWorkspaceMembers({
      workspaceId,
      where: { id: In(uniqueIds) },
    });

    return workspaceMembers
      .map((workspaceMember) => workspaceMember.userId)
      .filter(isDefined);
  }

  // Workspace members live in the workspace schema, so reading them needs a
  // workspace context the settings request does not carry on its own.
  private async findWorkspaceMembers({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where?: FindOptionsWhere<WorkspaceMemberWorkspaceEntity>;
  }): Promise<WorkspaceMemberWorkspaceEntity[]> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
            { shouldBypassPermissionChecks: true },
          );

        return workspaceMemberRepository.find(
          isDefined(where) ? { where } : {},
        );
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private async findQueueOrThrow({
    workspaceId,
    queueId,
  }: {
    workspaceId: string;
    queueId: string;
  }): Promise<InboxQueueEntity> {
    const queue = await this.inboxQueueRepository.findOne(workspaceId, {
      where: { id: queueId },
    });

    if (!isDefined(queue)) {
      throw new InboxException(
        `Inbox queue ${queueId} not found`,
        InboxExceptionCode.UNKNOWN_INBOX_QUEUE,
      );
    }

    return queue;
  }

  // Two queues can share a display name, but not an address. A name that
  // slugifies to nothing at all still needs one, so it falls back to the word.
  private async buildAvailableSlug({
    workspaceId,
    name,
  }: {
    workspaceId: string;
    name: string;
  }): Promise<string> {
    const baseSlug = getSubdomainSlugFromDisplayName(name) ?? 'inbox';

    const takenSlugs = new Set(
      (
        await this.inboxQueueRepository.find(workspaceId, {
          select: { slug: true },
        })
      ).map((queue) => queue.slug),
    );

    if (!takenSlugs.has(baseSlug)) {
      return baseSlug;
    }

    let suffix = 2;

    while (takenSlugs.has(`${baseSlug}-${suffix}`)) {
      suffix += 1;
    }

    return `${baseSlug}-${suffix}`;
  }
}
