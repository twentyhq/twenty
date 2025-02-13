import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  Inbox,
  IntegrationType,
} from 'src/engine/core-modules/inbox/inbox.entity';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';

@Injectable()
export class InboxService {
  constructor(
    @InjectRepository(Inbox, 'core')
    private readonly inboxRepository: Repository<Inbox>,
  ) {}

  async create(
    createdIntegration: WhatsappIntegration,
    integrationType: IntegrationType,
  ): Promise<Inbox> {
    if (integrationType === IntegrationType.WHATSAPP) {
      const createdInbox = await this.inboxRepository.create({
        integrationType: IntegrationType.WHATSAPP,
        whatsappIntegration: createdIntegration,
        workspace: createdIntegration.workspace,
      });

      return await this.inboxRepository.save(createdInbox);
    }

    throw new Error('Invalid integration type');
  }

  async findAll(workspaceId: string): Promise<Inbox[]> {
    return await this.inboxRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace', 'whatsappIntegration'],
    });
  }
}
