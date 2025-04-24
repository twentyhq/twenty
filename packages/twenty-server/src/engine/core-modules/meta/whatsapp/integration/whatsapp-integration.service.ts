import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { CreateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/create-whatsapp-integration.input';
import { UpdateWhatsappIntegrationInput } from 'src/engine/core-modules/meta/whatsapp/integration/dtos/update-whatsapp-integration.input';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';

export class WhatsappIntegrationService {
  constructor(
    @InjectRepository(WhatsappIntegration, 'core')
    private whatsappIntegrationRepository: Repository<WhatsappIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly environmentService: TwentyConfigService,
    private readonly inboxService: InboxService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async create(
    createInput: CreateWhatsappIntegrationInput,
    workspaceId: string,
  ): Promise<WhatsappWorkspaceEntity> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdIntegration = whatsappRepository.create({
      ...createInput,
      disabled: false,
      sla: 30,
      verifyToken: v4(),
    });

    const savedIntegration = await whatsappRepository.save(createdIntegration);

    // await this.inboxService.create(
    //   createdIntegration,
    //   IntegrationType.WHATSAPP,
    //   workspace,
    // );

    await this.subscribeWebhook(savedIntegration, workspaceId);

    return savedIntegration;
  }

  async findAll(workspaceId: string): Promise<WhatsappWorkspaceEntity[]> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    return await whatsappRepository.find();
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<WhatsappWorkspaceEntity | null> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    return await whatsappRepository.findOne({
      where: { id },
    });
  }

  async update(
    updateInput: UpdateWhatsappIntegrationInput,
    workspaceId: string,
  ): Promise<WhatsappWorkspaceEntity> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    const integration = await whatsappRepository.findOne({
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

    await whatsappRepository.save(updateIntegration);

    const hasAppIdChanged = oldIntegration.appId !== updateIntegration.appId;
    const hasAppKeyChanged = oldIntegration.appKey !== updateIntegration.appKey;
    const hasAccessTokenChanged =
      oldIntegration.accessToken !== updateIntegration.accessToken;

    if (hasAppIdChanged || hasAppKeyChanged || hasAccessTokenChanged) {
      await this.subscribeWebhook(updateIntegration, workspaceId);
    }

    return updateIntegration;
  }

  async toggleStatus(
    integrationId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    const integration = await whatsappRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    integration.disabled = !integration.disabled;

    await whatsappRepository.save(integration);

    return integration.disabled;
  }

  async updateServiceLevel(
    integrationId: string,
    sla: number,
    workspaceId: string,
  ): Promise<WhatsappWorkspaceEntity> {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    if (!whatsappRepository) {
      throw new Error('Whatsapp repository not found');
    }

    const integration = await this.findById(integrationId, workspaceId);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    integration.sla = sla;

    await whatsappRepository.save(integration);

    return integration;
  }

  private async subscribeWebhook(
    integration: WhatsappWorkspaceEntity,
    workspaceId: string,
  ) {
    const { id, appId, verifyToken, appKey } = integration;

    const META_API_URL = this.environmentService.get('META_API_URL');
    const META_WEBHOOK_URL = `${this.environmentService.get('META_WEBHOOK_URL')}/whatsapp/webhook/${workspaceId}/${id}`;

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
