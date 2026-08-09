import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import {
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueMemberEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-member.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { isUniqueViolation } from 'src/engine/core-modules/inbox/utils/is-unique-violation.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
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
    memberUserWorkspaceIds,
  }: {
    workspaceId: string;
    name: string;
    icon?: string | null;
    memberUserWorkspaceIds: string[];
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
      memberUserWorkspaceIds,
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
    memberUserWorkspaceIds,
  }: {
    workspaceId: string;
    queueId: string;
    memberUserWorkspaceIds: string[];
  }): Promise<void> {
    // Membership is read access, so an id that does not belong to this
    // workspace is dropped rather than trusted: the caller names people, it
    // does not get to invent them.
    const workspaceMemberIds = await this.keepWorkspaceMembers({
      workspaceId,
      userWorkspaceIds: memberUserWorkspaceIds,
    });

    await this.inboxQueueMemberRepository.delete(workspaceId, { queueId });

    if (workspaceMemberIds.length === 0) {
      return;
    }

    await this.inboxQueueMemberRepository.saveMany(
      workspaceId,
      workspaceMemberIds.map((userWorkspaceId) => ({
        queueId,
        userWorkspaceId,
      })),
    );
  }

  private async keepWorkspaceMembers({
    workspaceId,
    userWorkspaceIds,
  }: {
    workspaceId: string;
    userWorkspaceIds: string[];
  }): Promise<string[]> {
    const uniqueIds = [...new Set(userWorkspaceIds)];

    if (uniqueIds.length === 0) {
      return [];
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(uniqueIds), workspaceId },
      select: { id: true },
    });

    return userWorkspaces.map((userWorkspace) => userWorkspace.id);
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
