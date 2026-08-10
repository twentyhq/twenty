import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import {
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { type DataSource, In } from 'typeorm';

import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { isUniqueViolation } from 'src/engine/core-modules/inbox/utils/is-unique-violation.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export const DEFAULT_INBOX_QUEUE_SLUG = 'triage';

@Injectable()
export class InboxQueueService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxQueueEntity)
    private readonly inboxQueueRepository: WorkspaceScopedRepository<InboxQueueEntity>,
    @InjectWorkspaceScopedRepository(InboxQueueRoleEntity)
    private readonly inboxQueueRoleRepository: WorkspaceScopedRepository<InboxQueueRoleEntity>,
    @InjectWorkspaceScopedRepository(InboxItemEntity)
    private readonly inboxItemRepository: WorkspaceScopedRepository<InboxItemEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  // The shared inboxes a person can reach, which is also the set whose items
  // they may read, so every read scope is built from it. Access follows their
  // role: it is a permission, granted where the workspace's other permissions
  // are, rather than a second list of people to keep in step by hand.
  async findAccessibleQueueIds({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string[]> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const grants = await this.inboxQueueRoleRepository.find(workspaceId, {
      where: { roleId },
    });

    return grants.map((grant) => grant.queueId);
  }

  async findAccessibleQueues({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<InboxQueueEntity[]> {
    const queueIds = await this.findAccessibleQueueIds({
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

  async findAccessibleQueueBySlug({
    workspaceId,
    userWorkspaceId,
    slug,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    slug: string;
  }): Promise<InboxQueueEntity | null> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const grant = await this.inboxQueueRoleRepository.findOne(workspaceId, {
      // The join is part of an authorization gate, so the queue carries the
      // tenant predicate rather than inheriting it from the grant row
      where: { roleId, queue: { slug, workspaceId } },
      relations: { queue: true },
    });

    return grant?.queue ?? null;
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

  async findQueueRoleIdsByQueue({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<Map<string, string[]>> {
    const grants = await this.inboxQueueRoleRepository.find(workspaceId);

    return grants.reduce((roleIdsByQueue, grant) => {
      const roleIds = roleIdsByQueue.get(grant.queueId) ?? [];

      roleIdsByQueue.set(grant.queueId, [...roleIds, grant.roleId]);

      return roleIdsByQueue;
    }, new Map<string, string[]>());
  }

  async createQueue({
    workspaceId,
    name,
    icon,
    roleIds,
  }: {
    workspaceId: string;
    name: string;
    icon?: string | null;
    roleIds: string[];
  }): Promise<InboxQueueEntity> {
    const queue = await this.inboxQueueRepository.save(workspaceId, {
      name,
      slug: await this.buildAvailableSlug({ workspaceId, name }),
      icon: icon ?? null,
      isDefault: false,
    });

    await this.setQueueRoles({
      workspaceId,
      queueId: queue.id,
      roleIds,
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

  // Which roles can reach this shared inbox. Granting access is a permission
  // change, so it names roles rather than people.
  async setQueueRoles({
    workspaceId,
    queueId,
    roleIds,
  }: {
    workspaceId: string;
    queueId: string;
    roleIds: string[];
  }): Promise<void> {
    const queue = await this.findQueueOrThrow({ workspaceId, queueId });

    await this.assertRolesBelongToWorkspace({ workspaceId, roleIds });

    // Replacing the list is a delete plus an insert, which two admins saving at
    // once would interleave into the union of both lists. The queue row is
    // locked first so the second save waits and genuinely replaces the first.
    await this.coreDataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .select('queue.id')
        .from(InboxQueueEntity, 'queue')
        .where('queue.id = :queueId', { queueId: queue.id })
        .setLock('pessimistic_write')
        .getOne();

      const queueRoleRepository =
        this.inboxQueueRoleRepository.withManager(manager);

      await queueRoleRepository.delete(workspaceId, { queueId: queue.id });

      if (roleIds.length === 0) {
        return;
      }

      await queueRoleRepository.saveMany(
        workspaceId,
        roleIds.map((roleId) => ({ queueId: queue.id, roleId })),
      );
    });
  }

  async findQueueOrThrow({
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

  // A role from another workspace would satisfy the foreign key and land as a
  // grant nobody here can see, so it is rejected before it is written.
  private async assertRolesBelongToWorkspace({
    workspaceId,
    roleIds,
  }: {
    workspaceId: string;
    roleIds: string[];
  }): Promise<void> {
    if (roleIds.length === 0) {
      return;
    }

    const roles = await this.roleRepository.find(workspaceId, {
      where: { id: In(roleIds) },
      select: { id: true },
    });

    const knownRoleIds = new Set(roles.map((role) => role.id));
    const unknownRoleId = roleIds.find((roleId) => !knownRoleIds.has(roleId));

    if (isDefined(unknownRoleId)) {
      throw new InboxException(
        `Role ${unknownRoleId} not found`,
        InboxExceptionCode.UNKNOWN_INBOX_ROLE,
      );
    }
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
