import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { STANDARD_INBOX_ITEM_TYPES } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import { InboxQueueService } from 'src/engine/core-modules/inbox/services/inbox-queue.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class InboxItemTypeService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemTypeEntity)
    private readonly inboxItemTypeRepository: WorkspaceScopedRepository<InboxItemTypeEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly inboxQueueService: InboxQueueService,
  ) {}

  async findByKey({
    workspaceId,
    key,
  }: {
    workspaceId: string;
    key: string;
  }): Promise<InboxItemTypeEntity | null> {
    const existingType = await this.inboxItemTypeRepository.findOne(
      workspaceId,
      { where: { key, deletedAt: IsNull() } },
    );

    if (isDefined(existingType)) {
      return existingType;
    }

    // Only a standard key can be missing because seeding has not run; an
    // unknown key would pay for a seed on every call and still return nothing.
    if (!STANDARD_INBOX_ITEM_TYPES.some((type) => type.key === key)) {
      return null;
    }

    await this.seedStandardTypes({ workspaceId });

    return this.inboxItemTypeRepository.findOne(workspaceId, {
      where: { key, deletedAt: IsNull() },
    });
  }

  // Seeded first, so a workspace that has never routed anything still has
  // something to configure and one seeded by an older release picks up the
  // current declarations.
  async findAllForSettings({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<InboxItemTypeEntity[]> {
    await this.seedStandardTypes({ workspaceId });

    return this.inboxItemTypeRepository.find(workspaceId, {
      where: { deletedAt: IsNull() },
      order: { label: 'ASC' },
    });
  }

  async setDefaultQueue({
    workspaceId,
    inboxItemTypeId,
    defaultQueueId,
  }: {
    workspaceId: string;
    inboxItemTypeId: string;
    defaultQueueId: string | null;
  }): Promise<InboxItemTypeEntity> {
    const inboxItemType = await this.inboxItemTypeRepository.findOne(
      workspaceId,
      { where: { id: inboxItemTypeId, deletedAt: IsNull() } },
    );

    if (!isDefined(inboxItemType)) {
      throw new InboxException(
        `Inbox item type ${inboxItemTypeId} not found`,
        InboxExceptionCode.UNKNOWN_INBOX_ITEM_TYPE,
      );
    }

    // Looked up through the workspace-scoped repository, so a queue id from
    // another workspace is rejected rather than becoming an address this
    // workspace can no longer see into.
    if (isDefined(defaultQueueId)) {
      await this.inboxQueueService.findQueueOrThrow({
        workspaceId,
        queueId: defaultQueueId,
      });
    }

    await this.inboxItemTypeRepository.update(
      workspaceId,
      { id: inboxItemType.id },
      { defaultQueueId },
    );

    return { ...inboxItemType, defaultQueueId };
  }

  // Identity is (workspaceId, universalIdentifier), so re-running updates the
  // declaration in place rather than duplicating it.
  async seedStandardTypes({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const twentyStandardApplication = await this.applicationRepository.findOne({
      where: {
        workspaceId,
        universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
    });

    if (!isDefined(twentyStandardApplication)) {
      return;
    }

    await this.inboxItemTypeRepository.upsert(
      workspaceId,
      STANDARD_INBOX_ITEM_TYPES.map((standardType) => ({
        applicationId: twentyStandardApplication.id,
        universalIdentifier: standardType.universalIdentifier,
        key: standardType.key,
        label: standardType.label,
        icon: standardType.icon,
        defaultPriority: standardType.defaultPriority,
      })),
      { conflictPaths: ['workspaceId', 'universalIdentifier'] },
    );
  }
}
