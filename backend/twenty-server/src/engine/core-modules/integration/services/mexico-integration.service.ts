import { Injectable, Logger } from '@nestjs/common';
import { IntegrationService, IntegrationConfig } from './services/integration.service';
import { IntegrationProvider } from './enums/integration-provider.enum';

export interface WhatsAppMessage {
  to: string;
  message: string;
  template?: string;
}

export interface MercadoPagoPayment {
  amount: number;
  description: string;
  email: string;
  paymentMethod: 'pix' | 'card' | 'ticket';
}

export interface NotificationPayload {
  type: 'whatsapp' | 'sms' | 'email' | 'slack';
  to: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MexicoIntegrationService {
  private readonly logger = new Logger(MexicoIntegrationService.name);

  constructor(private readonly integrationService: IntegrationService) {}

  async sendWhatsAppMessage(
    workspaceId: string,
    payload: WhatsAppMessage,
  ): Promise<{ messageId: string; status: string }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.WHATSAPP);
    
    if (!driver.sendMessage) {
      throw new Error('WhatsApp driver does not support sending messages');
    }

    const result = await driver.sendMessage(payload.message, payload.to) as { messageId: string };
    
    this.logger.log(`WhatsApp message sent to ${payload.to}: ${result.messageId}`);
    
    return {
      messageId: result.messageId,
      status: 'sent',
    };
  }

  async createMercadoPagoPayment(
    workspaceId: string,
    payload: MercadoPagoPayment,
  ): Promise<{
    paymentId: number;
    status: string;
    paymentUrl?: string;
    qrCode?: string;
  }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.MERCADO_PAGO);
    
    if (!driver.createPayment) {
      throw new Error('Mercado Pago driver does not support payments');
    }

    const result = await driver.createPayment(
      payload.amount,
      payload.description,
      payload.email,
    ) as { id: number; status: string; init_point?: string };

    this.logger.log(`Mercado Pago payment created: ${result.id} - Status: ${result.status}`);
    
    return {
      paymentId: result.id,
      status: result.status,
      paymentUrl: result.init_point,
    };
  }

  async sendSMS(
    workspaceId: string,
    to: string,
    message: string,
  ): Promise<{ messageId: string; status: string }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.TWILIO);
    
    if (!driver.sendMessage) {
      throw new Error('Twilio driver does not support sending SMS');
    }

    const result = await driver.sendMessage(message, to) as { sid: string; status: string };
    
    this.logger.log(`SMS sent to ${to}: ${result.sid}`);
    
    return {
      messageId: result.sid,
      status: result.status,
    };
  }

  async notifyTeamSlack(
    workspaceId: string,
    channel: string,
    message: string,
  ): Promise<{ ts: string; channel: string }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.SLACK);
    
    if (!driver.sendMessage) {
      throw new Error('Slack driver does not support sending messages');
    }

    const result = await driver.sendMessage(message, channel) as { ts: string; channel: string };
    
    this.logger.log(`Slack message sent to ${channel}: ${result.ts}`);
    
    return result;
  }

  async createHubSpotContact(
    workspaceId: string,
    contact: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
    },
  ): Promise<{ contactId: string }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.HUBSPOT);
    
    const result = await (driver as any).createContact(
      contact.email,
      contact.firstName,
      contact.lastName,
    ) as { id: string };
    
    this.logger.log(`HubSpot contact created: ${result.id}`);
    
    return { contactId: result.id };
  }

  async createLinearIssue(
    workspaceId: string,
    issue: {
      title: string;
      description: string;
      teamId?: string;
    },
  ): Promise<{ issueId: string; url: string }> {
    const driver = this.integrationService.getDriver(IntegrationProvider.LINEAR);
    
    const result = await (driver as any).createIssue(
      issue.title,
      issue.description,
      issue.teamId,
    ) as { id: string; url: string };
    
    this.logger.log(`Linear issue created: ${result.id}`);
    
    return {
      issueId: result.id,
      url: result.url,
    };
  }

  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; messageId?: string }> {
    try {
      switch (payload.type) {
        case 'whatsapp':
          const whatsappResult = await this.sendWhatsAppMessage('', {
            to: payload.to,
            message: payload.message,
          });
          return { success: true, messageId: whatsappResult.messageId };
        
        case 'sms':
          const smsResult = await this.sendSMS('', payload.to, payload.message);
          return { success: true, messageId: smsResult.messageId };
        
        case 'slack':
          await this.notifyTeamSlack('', payload.to, payload.message);
          return { success: true };
        
        default:
          return { success: false };
      }
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      return { success: false };
    }
  }
}
