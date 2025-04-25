import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import {
  SendEventMessageInput,
  SendMessageInput,
  SendTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-message.input';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

@Resolver('Whatsapp')
export class WhatsappResolver {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Mutation(() => Boolean)
  async sendTemplate(
    @Args('sendTemplateInput') sendTemplateInput: SendTemplateInput,
  ) {
    const sendTemplateConfirmation =
      await this.whatsappService.sendTemplate(sendTemplateInput);

    if (sendTemplateConfirmation) {
      const today = new Date();
      const messageEvent = `${sendTemplateInput.agent?.name} started the service (${today.toISOString().split('T')[0].replace(/-/g, '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`;

      const lastMessage = {
        createdAt: today,
        from: 'system',
        message: sendTemplateInput.message,
        type: 'template',
      };

      const timeline = {
        agent: `${sendTemplateInput.agent?.name}`,
        date: today,
        event: 'started',
      };

      const whatsappIntegration: Omit<
        WhatsappDocument,
        'unreadMessages' | 'isVisible'
      > = {
        integrationId: sendTemplateInput.integrationId,
        client: {
          phone: sendTemplateInput.to.slice(1),
          name: sendTemplateInput.to.slice(1),
        },
        messages: [
          {
            ...lastMessage,
          },
        ],
        status: statusEnum.InProgress,
        timeline: [timeline],
        agent: sendTemplateInput.agent?.id,
        sector: 'empty',
        lastMessage,
      };

      await this.whatsappService.saveMessageAtFirebase(
        whatsappIntegration,
        false,
      );

      return await this.whatsappService.saveEventMessageAtFirebase({
        ...whatsappIntegration,
        messages: [
          {
            ...lastMessage,
            message: messageEvent,
            type: 'started',
          },
        ],
      });
    }

    return false;
  }

  @Mutation(() => Boolean)
  async sendMessage(
    @Args('sendMessageInput') sendMessageInput: SendMessageInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const sendMessageConfirmation = await this.whatsappService.sendMessage(
      sendMessageInput,
      workspace.id,
    );

    if (sendMessageConfirmation) {
      const lastMessage = {
        createdAt: new Date(),
        from: sendMessageInput.from,
        message: sendMessageInput.fileId
          ? sendMessageInput.fileId
          : sendMessageInput.message || '',
        type: sendMessageInput.type,
      };

      const whatsappIntegration: Omit<
        WhatsappDocument,
        'timeline' | 'unreadMessages' | 'isVisible'
      > = {
        integrationId: sendMessageInput.integrationId,
        client: {
          phone: sendMessageInput.to,
        },
        messages: [
          {
            ...lastMessage,
          },
        ],
        status: statusEnum.Waiting,
        lastMessage,
      };

      return await this.whatsappService.saveMessageAtFirebase(
        whatsappIntegration,
        false,
      );
    }

    return false;
  }

  @Mutation(() => Boolean)
  async sendEventMessage(
    @Args('sendEventMessageInput') sendEventMessageInput: SendEventMessageInput,
  ) {
    const timeline =
      sendEventMessageInput.eventStatus === 'transfer'
        ? {
            agent: `${sendEventMessageInput.from}`,
            date: new Date(),
            event: sendEventMessageInput.eventStatus,
            transferTo: sendEventMessageInput.agent
              ? `${sendEventMessageInput.agent.name}`
              : sendEventMessageInput.sector?.name,
          }
        : {
            agent: `${sendEventMessageInput.from}`,
            date: new Date(),
            event: sendEventMessageInput.eventStatus,
          };

    const whatsappIntegration: Omit<
      WhatsappDocument,
      'unreadMessages' | 'lastMessage' | 'isVisible'
    > = {
      integrationId: sendEventMessageInput.integrationId,
      client: {
        phone: sendEventMessageInput.to,
      },
      messages: [
        {
          createdAt: new Date(),
          from: sendEventMessageInput?.from || 'system',
          message: sendEventMessageInput.message || '',
          type: sendEventMessageInput.eventStatus,
        },
      ],
      status: sendEventMessageInput.status as statusEnum,
      timeline: [timeline],
      agent: sendEventMessageInput.agent
        ? sendEventMessageInput.agent.id
        : 'empty',
      sector: sendEventMessageInput.sector
        ? sendEventMessageInput.sector.id
        : 'empty',
    };

    return await this.whatsappService.saveEventMessageAtFirebase(
      whatsappIntegration,
    );
  }

  @Query(() => WhatsappTemplatesResponse)
  getWhatsappTemplates(@Args('integrationId') integrationId: string) {
    return this.whatsappService.getWhatsappTemplates(integrationId);
  }
}
