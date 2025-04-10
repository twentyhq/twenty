import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { IntegrationType } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { CreateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/create-whatsapp-integration.input';
import { UpdateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/update-whatsapp-integration.input';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export class WhatsappIntegrationService {
  constructor(
    @InjectRepository(WhatsappIntegration, 'core')
    private whatsappIntegrationRepository: Repository<WhatsappIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: TwentyConfigService,
    private readonly inboxService: InboxService,
  ) {}

  async create(
    createInput: CreateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdIntegration = this.whatsappIntegrationRepository.create({
      ...createInput,
      workspace: workspace,
      sla: 30,
      verifyToken: v4(),
    });

    await this.whatsappIntegrationRepository.save(createdIntegration);

    await this.inboxService.create(
      createdIntegration,
      IntegrationType.WHATSAPP,
    );

    await this.subscribeWebhook(createdIntegration);

    return createdIntegration;
  }

  async findAll(workspaceId: string): Promise<WhatsappIntegration[]> {
    return await this.whatsappIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: [`workspace`],
    });
  }

  async findById(id: string): Promise<WhatsappIntegration | null> {
    return await this.whatsappIntegrationRepository.findOne({
      where: { id },
    });
  }

  async update(
    updateInput: UpdateWhatsappIntegrationInput,
  ): Promise<WhatsappIntegration> {
    const integration = await this.whatsappIntegrationRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const oldIntegration = { ...integration };

    const updateIntegration = {
      ...integration,
      ...updateInput,
    };

    await this.whatsappIntegrationRepository.save(updateIntegration);

    const hasAppIdChanged = oldIntegration.appId !== updateIntegration.appId;
    const hasAppKeyChanged = oldIntegration.appKey !== updateIntegration.appKey;
    const hasAccessTokenChanged =
      oldIntegration.accessToken !== updateIntegration.accessToken;

    if (hasAppIdChanged || hasAppKeyChanged || hasAccessTokenChanged) {
      await this.subscribeWebhook(updateIntegration);
    }

    return updateIntegration;
  }

  async toggleStatus(integrationId: string): Promise<boolean> {
    const integration = await this.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.disabled = !integration.disabled;

    await this.whatsappIntegrationRepository.save(integration);

    return integration.disabled;
  }

  async updateServiceLevel(
    integrationId: string,
    sla: number,
  ): Promise<WhatsappIntegration> {
    const integration = await this.findById(integrationId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.sla = sla;

    await this.whatsappIntegrationRepository.save(integration);

    return integration;
  }

  private async subscribeWebhook(integration: WhatsappIntegration) {
    const { id, appId, verifyToken, appKey } = integration;

    const META_API_URL = this.environmentService.get('META_API_URL');
    const META_WEBHOOK_URL = `${this.environmentService.get('META_WEBHOOK_URL')}/whatsapp/webhook/${id}`;

    const fields = 'messages';

    const url = `${META_API_URL}/${appId}/subscriptions`;

    const params = {
      access_token: `${appId}|${appKey}`,
      object: 'whatsapp_business_account',
      callback_url: META_WEBHOOK_URL,
      verify_token: verifyToken,
      fields: fields,
    };

    try {
      await axios.post(url, params, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to call subscriptions API', err);
      throw new Error('Failed to call subscriptions API');
    }
  }
}
