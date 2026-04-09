import { Injectable, Logger } from '@nestjs/common';

import { ChannelType } from 'src/modules/omnichannel/enums/channel-type.enum';

export interface OmnichannelMessage {
  channel: ChannelType;
  content: string;
  recipient: string;
  sender?: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface ConversationStats {
  channel: string;
  messagesCount: number;
  avgResponseTime: number;
  openConversations: number;
}

@Injectable()
export class OmnichannelService {
  private readonly logger = new Logger(OmnichannelService.name);

  async sendMessage(message: OmnichannelMessage): Promise<string> {
    const messageId = await this.dispatchToProvider(message);
    this.logger.log(`Sent ${message.channel} message to ${message.recipient}: ${messageId}`);
    return messageId;
  }

  async receiveMessage(
    channel: ChannelType,
    messageData: { messageId: string; content: string; sender: string; senderName?: string; mediaUrl?: string },
    contactId?: string,
  ): Promise<{ id: string }> {
    this.logger.log(`Received ${channel} message from ${messageData.sender}`);
    return { id: messageData.messageId };
  }

  async getConversation(
    contactId: string,
    _options?: { channel?: ChannelType; limit?: number },
  ): Promise<unknown[]> {
    this.logger.log(`Getting conversation for contact ${contactId}`);
    return [];
  }

  async getInbox(
    _filters?: { channel?: ChannelType; status?: string; assigneeId?: string },
    _limit = 50,
  ): Promise<unknown[]> {
    this.logger.log('Getting omnichannel inbox');
    return [];
  }

  async assignToAgent(messageId: string, agentId: string): Promise<void> {
    this.logger.log(`Assigning message ${messageId} to agent ${agentId}`);
  }

  async markAsRead(messageId: string): Promise<void> {
    this.logger.log(`Marking message ${messageId} as read`);
  }

  async getChannelStats(): Promise<ConversationStats[]> {
    return Object.values(ChannelType).map((channel) => ({
      channel,
      messagesCount: 0,
      avgResponseTime: 0,
      openConversations: 0,
    }));
  }

  private async dispatchToProvider(message: OmnichannelMessage): Promise<string> {
    const prefixes: Record<string, string> = {
      [ChannelType.WHATSAPP]: 'wa',
      [ChannelType.SMS]: 'sms',
      [ChannelType.EMAIL]: 'email',
      [ChannelType.TELEGRAM]: 'tg',
      [ChannelType.INSTAGRAM]: 'social',
      [ChannelType.FACEBOOK]: 'social',
    };
    const prefix = prefixes[message.channel] ?? 'msg';
    this.logger.log(`Dispatching ${message.channel} to ${message.recipient}`);
    return `${prefix}_${Date.now()}`;
  }
}
