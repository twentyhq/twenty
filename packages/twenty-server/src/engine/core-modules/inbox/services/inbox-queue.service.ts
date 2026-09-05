import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import {
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { type DataSource, type EntityManager, In } from 'typeorm';

import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { isUniqueViolation } from 'src/engine/core-modules/inbox/utils/is-unique-violation.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const MAX_SLUG_ATTEMPTS = 3;

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
    @InjectWorkspaceScopedRepository(InboxItemTypeEntity)
    private readonly inboxItemTypeRepository: WorkspaceScopedRepository<InboxItemTypeEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    private readonly userRoleService: UserRoleService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  // The shared inboxes a person can reach, which is also the set whose items
  // they may read, so every read scope is built from it.
  async findAccessibleQueueIds({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string[]> {
    const roleId = await this.findRoleId({ workspaceId, userWorkspaceId });

    const [grants, defaultQueue] = await Promise.all([
      isDefined(roleId)
        ? this.inboxQueueRoleRepository.find(workspaceId, { where: { roleId } })
        : [],
      this.inboxQueueRepository.findOne(workspaceId, {
        where: { isDefault: true },
      }),
    ]);

    // Triage catches work nothing else claimed, so it needs no grant: the
    // whole workspace can reach it once it exists.
    return [
      ...new Set([
        ...grants.map((grant) => grant.queueId),
        ...(isDefined(defaultQueue) ? [defaultQueue.id] : []),
      ]),
    ];
  }

  // Someone with no role yet simply reaches no granted queue, which is not an
  // error worth surfacing from every inbox read.
  private async findRoleId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string | null> {
    try {
      return await this.userRoleService.getRoleIdForUserWorkspace({
        workspaceId,
        userWorkspaceId,
      });
    } catch (error) {
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE
      ) {
        return null;
      }

      throw error;
    }
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
    const queueIds = await this.findAccessibleQueueIds({
      workspaceId,
      userWorkspaceId,
    });

    if (queueIds.length === 0) {
      return null;
    }

    return this.inboxQueueRepository.findOne(workspaceId, {
      where: { id: In(queueIds), slug },
    });
  }

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
      return await this.inboxQueueRepository.insertAndReturnOne(workspaceId, {
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
    // Checked before the insert so a bad grant cannot leave an orphan queue.
    await this.assertRolesBelongToWorkspace({ workspaceId, roleIds });

    const queue = await this.insertQueueWithAvailableSlug({
      workspaceId,
      name,
      icon,
    });

    await this.setQueueRoles({
      workspaceId,
      queueId: queue.id,
      roleIds,
    });

    return queue;
  }

  // Two admins creating queues with the same name at once can both pick the
  // same free slug; the unique index arbitrates and the loser tries the next.
  private async insertQueueWithAvailableSlug({
    workspaceId,
    name,
    icon,
  }: {
    workspaceId: string;
    name: string;
    icon?: string | null;
  }): Promise<InboxQueueEntity> {
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
      try {
        return await this.inboxQueueRepository.insertAndReturnOne(workspaceId, {
          name,
          slug: await this.buildAvailableSlug({ workspaceId, name }),
          icon: icon ?? null,
          isDefault: false,
        });
      } catch (error) {
        if (!isUniqueViolation(error)) {
          throw error;
        }
      }
    }

    throw new InboxException(
      `Could not find an available address for inbox queue ${name}`,
      InboxExceptionCode.INTERNAL_SERVER_ERROR,
    );
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

  // Deleting a queue cascades to its items, so the work moves out first.
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

    // The queue row is locked for update first: inserting an item takes a key
    // share on its queue, so a route in flight either commits before the move
    // below and moves with the rest, or waits and fails on the key once the
    // queue is gone, rather than landing between the move and the delete and
    // being swept up by the cascade.
    await this.coreDataSource.transaction(async (manager) => {
      // Detached before the queue lock, in the order a default-queue change
      // takes its locks, so the two cannot wait on each other.
      await this.inboxItemTypeRepository
        .withManager(manager)
        .update(
          workspaceId,
          { defaultQueueId: queue.id },
          { defaultQueueId: null },
        );

      await this.lockQueueOrThrow({ manager, workspaceId, queueId: queue.id });

      // A slot is unique per queue, so a moved item could collide with one
      // triage already holds. It gives up its slot rather than its existence.
      await this.inboxItemRepository
        .withManager(manager)
        .update(
          workspaceId,
          { queueId: queue.id },
          { queueId: defaultQueue.id, slotKey: null },
        );

      await this.inboxQueueRepository
        .withManager(manager)
        .delete(workspaceId, { id: queue.id });
    });
  }

  async setQueueRoles({
    workspaceId,
    queueId,
    roleIds,
  }: {
    workspaceId: string;
    queueId: string;
    roleIds: string[];
  }): Promise<InboxQueueEntity> {
    const queue = await this.findQueueOrThrow({ workspaceId, queueId });

    await this.assertRolesBelongToWorkspace({ workspaceId, roleIds });

    // Replacing the list is a delete plus an insert, which two admins saving at
    // once would interleave into the union of both lists. The queue row is
    // locked first so the second save waits and genuinely replaces the first.
    return this.coreDataSource.transaction(async (manager) => {
      const lockedQueue = await this.lockQueueOrThrow({
        manager,
        workspaceId,
        queueId: queue.id,
      });

      const queueRoleRepository =
        this.inboxQueueRoleRepository.withManager(manager);

      await queueRoleRepository.delete(workspaceId, { queueId: queue.id });

      if (roleIds.length > 0) {
        await queueRoleRepository.insert(
          workspaceId,
          roleIds.map((roleId) => ({ queueId: queue.id, roleId })),
        );
      }

      return lockedQueue;
    });
  }

  // The queue can be deleted between a lookup and taking the lock; writing
  // rows that reference it would then fail on the foreign key instead of
  // reporting the queue as gone.
  private async lockQueueOrThrow({
    manager,
    workspaceId,
    queueId,
  }: {
    manager: EntityManager;
    workspaceId: string;
    queueId: string;
  }): Promise<InboxQueueEntity> {
    const lockedQueue = await manager
      .getRepository(InboxQueueEntity)
      .createQueryBuilder('queue')
      .where('queue.id = :queueId', { queueId })
      .andWhere('queue.workspaceId = :workspaceId', { workspaceId })
      .setLock('pessimistic_write')
      .getOne();

    if (!isDefined(lockedQueue)) {
      throw new InboxException(
        `Inbox queue ${queueId} not found`,
        InboxExceptionCode.UNKNOWN_INBOX_QUEUE,
      );
    }

    return lockedQueue;
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

  // Two queues can share a display name, but not an address, and the triage
  // address stays reserved even before triage is created on demand.
  private async buildAvailableSlug({
    workspaceId,
    name,
  }: {
    workspaceId: string;
    name: string;
  }): Promise<string> {
    const baseSlug = getSubdomainSlugFromDisplayName(name) ?? 'inbox';

    const takenSlugs = new Set([
      DEFAULT_INBOX_QUEUE_SLUG,
      ...(
        await this.inboxQueueRepository.find(workspaceId, {
          select: { slug: true },
        })
      ).map((queue) => queue.slug),
    ]);

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
