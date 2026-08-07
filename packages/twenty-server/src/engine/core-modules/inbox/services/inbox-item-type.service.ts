import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { STANDARD_INBOX_ITEM_TYPES } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class InboxItemTypeService {
  constructor(
    @InjectWorkspaceScopedRepository(InboxItemTypeEntity)
    private readonly inboxItemTypeRepository: WorkspaceScopedRepository<InboxItemTypeEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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

    // A workspace created before this feature, or one whose standard
    // application sync has not run yet, still gets a working inbox
    await this.seedStandardTypes({ workspaceId });

    return this.inboxItemTypeRepository.findOne(workspaceId, {
      where: { key, deletedAt: IsNull() },
    });
  }

  // Idempotent: identity is (workspaceId, universalIdentifier), so re-running
  // updates the declaration in place rather than duplicating it.
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
        binding: standardType.binding,
        defaultPriority: standardType.defaultPriority,
        actions: standardType.actions,
      })),
      { conflictPaths: ['workspaceId', 'universalIdentifier'] },
    );
  }
}
