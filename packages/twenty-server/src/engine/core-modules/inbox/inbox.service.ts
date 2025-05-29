import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Inbox,
  IntegrationType,
} from 'src/engine/core-modules/inbox/inbox.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Inbox, 'core')
    private readonly inboxRepository: Repository<Inbox>,
  ) {}

  async create(
    createdIntegrationId: string,
    integrationType: IntegrationType,
    workspace: Workspace,
  ): Promise<Inbox> {
    if (integrationType === IntegrationType.WHATSAPP) {
      const createdInbox = await this.inboxRepository.create({
        integrationType: IntegrationType.WHATSAPP,
        whatsappIntegrationId: createdIntegrationId,
        workspace: workspace,
      });

      return await this.inboxRepository.save(createdInbox);
    }

    throw new Error('Invalid integration type');
  }

  async findAll(workspaceId: string): Promise<Inbox[]> {
    return await this.inboxRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });
  }
}
