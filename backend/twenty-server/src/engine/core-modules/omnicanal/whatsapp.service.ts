import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppConfigEntity, WhatsAppMessageEntity, MessageStatus, WhatsAppStatus } from './whatsapp.entity';

@Injectable()
export class WhatsAppService {
  constructor(
    @InjectRepository(WhatsAppConfigEntity)
    private readonly configRepo: Repository<WhatsAppConfigEntity>,
    @InjectRepository(WhatsAppMessageEntity)
    private readonly messageRepo: Repository<WhatsAppMessageEntity>,
  ) {}

  async getConfig(workspaceId: string): Promise<WhatsAppConfigEntity> {
    let config = await this.configRepo.findOne({ where: { workspaceId } });
    if (!config) {
      config = this.configRepo.create({ workspaceId, status: WhatsAppStatus.DISCONNECTED });
      config = await this.configRepo.save(config);
    }
    return config;
  }

  async connect(workspaceId: string, phoneNumberId: string, accessToken: string): Promise<WhatsAppConfigEntity> {
    const config = await this.getConfig(workspaceId);
    config.phoneNumberId = phoneNumberId;
    config.accessToken = accessToken;
    config.status = WhatsAppStatus.CONNECTED;
    return this.configRepo.save(config);
  }

  async disconnect(workspaceId: string): Promise<WhatsAppConfigEntity> {
    const config = await this.getConfig(workspaceId);
    config.status = WhatsAppStatus.DISCONNECTED;
    config.accessToken = null;
    return this.configRepo.save(config);
  }

  async sendMessage(workspaceId: string, to: string, body: string): Promise<WhatsAppMessageEntity> {
    const config = await this.getConfig(workspaceId);
    if (config.status !== WhatsAppStatus.CONNECTED) {
      throw new NotFoundException('WhatsApp not connected');
    }

    const message = this.messageRepo.create({
      workspaceId,
      messageId: `msg_${Date.now()}`,
      to,
      body,
      status: MessageStatus.SENT,
      isIncoming: false,
    });

    config.messagesSent += 1;
    await this.configRepo.save(config);

    return this.messageRepo.save(message);
  }

  async getMessages(workspaceId: string, limit = 50): Promise<WhatsAppMessageEntity[]> {
    return this.messageRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(workspaceId: string): Promise<{ sent: number; received: number }> {
    const config = await this.getConfig(workspaceId);
    return { sent: config.messagesSent, received: config.messagesReceived };
  }
}