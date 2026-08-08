import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { InboxQueueMemberEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-member.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_QUEUE_SLUG = 'triage';

const toSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

@Injectable()
export class InboxQueueService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxQueueEntity)
    private readonly inboxQueueRepository: WorkspaceScopedRepository<InboxQueueEntity>,
    @InjectWorkspaceScopedRepository(InboxQueueMemberEntity)
    private readonly inboxQueueMemberRepository: WorkspaceScopedRepository<InboxQueueMemberEntity>,
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
    const queues = await this.findMemberQueues({
      workspaceId,
      userWorkspaceId,
    });

    return queues.find((queue) => queue.slug === slug) ?? null;
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
      const isConcurrentInsert =
        typeof error === 'object' &&
        isDefined(error) &&
        (error as { code?: string }).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      const concurrentQueue = isConcurrentInsert
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

  async createQueue({
    workspaceId,
    name,
    icon,
    memberUserWorkspaceIds,
  }: {
    workspaceId: string;
    name: string;
    icon?: string;
    memberUserWorkspaceIds: string[];
  }): Promise<InboxQueueEntity> {
    const queue = await this.inboxQueueRepository.save(workspaceId, {
      name,
      slug: toSlug(name),
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

  async setMembers({
    workspaceId,
    queueId,
    memberUserWorkspaceIds,
  }: {
    workspaceId: string;
    queueId: string;
    memberUserWorkspaceIds: string[];
  }): Promise<void> {
    await this.inboxQueueMemberRepository.delete(workspaceId, { queueId });

    if (memberUserWorkspaceIds.length === 0) {
      return;
    }

    await Promise.all(
      memberUserWorkspaceIds.map((userWorkspaceId) =>
        this.inboxQueueMemberRepository.save(workspaceId, {
          queueId,
          userWorkspaceId,
        }),
      ),
    );
  }
}
