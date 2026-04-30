import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IntegrationProvider, IntegrationStatus } from '../enums/integration-provider.enum';

export interface IntegrationConfig {
  provider: IntegrationProvider;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;
  settings?: Record<string, unknown>;
}

@Injectable()
export class IntegrationService {
  protected readonly logger = new Logger(IntegrationService.name);

  constructor() {}

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const driver = this.getDriver(config.provider);
    return await driver.testConnection(config);
  }

  async connect(config: IntegrationConfig): Promise<void> {
    const driver = this.getDriver(config.provider);
    await driver.connect(config);
  }

  async disconnect(provider: IntegrationProvider): Promise<void> {
    const driver = this.getDriver(provider);
    await driver.disconnect();
  }

  getDriver(provider: IntegrationProvider): IntegrationDriver {
    switch (provider) {
      case IntegrationProvider.WHATSAPP:
        return new WhatsAppDriver();
      case IntegrationProvider.SLACK:
        return new SlackDriver();
      case IntegrationProvider.NOTION:
        return new NotionDriver();
      case IntegrationProvider.MERCADO_PAGO:
        return new MercadoPagoDriver();
      case IntegrationProvider.TWILIO:
        return new TwilioDriver();
      case IntegrationProvider.TELEGRAM:
        return new TelegramDriver();
      case IntegrationProvider.HUBSPOT:
        return new HubSpotDriver();
      case IntegrationProvider.LINEAR:
        return new LinearDriver();
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}

export interface IntegrationDriver {
  connect(config: IntegrationConfig): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(config: IntegrationConfig): Promise<boolean>;
  sendMessage?(message: string, recipient: string): Promise<unknown>;
  getContacts?(): Promise<unknown[]>;
  createPayment?(amount: number, currency: string, description: string): Promise<unknown>;
}

class WhatsAppDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.settings?.phoneNumberId}/messages`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
        },
      },
    );
    return response.ok;
  }

  async sendMessage(message: string, recipient: string): Promise<{ messageId: string }> {
    if (!this.config?.accessToken) {
      throw new Error('WhatsApp not connected');
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.config.settings?.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: message },
        }),
      },
    );

    const data = await response.json();
    return { messageId: data.messages?.[0]?.id };
  }
}

class SlackDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    });
    const data = await response.json();
    return data.ok === true;
  }

  async sendMessage(message: string, recipient: string): Promise<{ ts: string; channel: string }> {
    if (!this.config?.accessToken) {
      throw new Error('Slack not connected');
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: recipient,
        text: message,
      }),
    });

    const data = await response.json();
    return { ts: data.ts, channel: data.channel };
  }

  async getContacts(): Promise<{ id: string; name: string; email: string }[]> {
    if (!this.config?.accessToken) {
      throw new Error('Slack not connected');
    }

    const response = await fetch('https://slack.com/api/users.list', {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    });
    const data = await response.json();
    return data.members?.map((m: { id: string; real_name: string; profile: { email: string } }) => ({
      id: m.id,
      name: m.real_name,
      email: m.profile?.email,
    })) || [];
  }
}

class NotionDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch('https://api.notion.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    });
    return response.ok;
  }

  async createPage(title: string, content: string): Promise<{ id: string; url: string }> {
    if (!this.config?.accessToken) {
      throw new Error('Notion not connected');
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { page_id: this.config.settings?.parentPageId },
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content } }],
            },
          },
        ],
      }),
    });

    const data = await response.json();
    return { id: data.id, url: data.url };
  }

  async getContacts(): Promise<{ id: string; title: string }[]> {
    if (!this.config?.accessToken) {
      throw new Error('Notion not connected');
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${this.config.settings?.databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return data.results?.map((r: { id: string; properties: { Name?: { title?: { plain_text: string }[] } } }) => ({
      id: r.id,
      title: r.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
    })) || [];
  }
}

class MercadoPagoDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    });
    return response.ok;
  }

  async createPayment(amount: number, description: string, email: string): Promise<{
    id: number;
    status: string;
    init_point: string;
  }> {
    if (!this.config?.accessToken) {
      throw new Error('Mercado Pago not connected');
    }

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description,
        payment_method_id: 'pix',
        payer: { email },
        notification_url: this.config.webhookUrl,
      }),
    });

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
      init_point: data.point_of_interaction?.transaction_data?.ticket_url,
    };
  }

  async getPaymentStatus(paymentId: number): Promise<{ status: string; status_detail: string }> {
    if (!this.config?.accessToken) {
      throw new Error('Mercado Pago not connected');
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    });

    const data = await response.json();
    return { status: data.status, status_detail: data.status_detail };
  }
}

class TwilioDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const credentials = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString('base64');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.settings?.accountSid}.json`,
      { headers: { Authorization: `Basic ${credentials}` } },
    );
    return response.ok;
  }

  async sendMessage(message: string, recipient: string): Promise<{ sid: string; status: string }> {
    if (!this.config?.apiKey || !this.config?.apiSecret || !this.config?.settings?.accountSid) {
      throw new Error('Twilio not connected');
    }

    const credentials = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
    const formData = new URLSearchParams();
    formData.append('To', recipient);
    formData.append('From', this.config.settings?.phoneNumber as string ?? '');
    formData.append('Body', message);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.config.settings?.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      },
    );

    const data = await response.json();
    return { sid: data.sid, status: data.status };
  }
}

class TelegramDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch(`https://api.telegram.org/bot${config.accessToken}/getMe`);
    const data = await response.json();
    return data.ok === true;
  }

  async sendMessage(message: string, recipient: string): Promise<{ message_id: number }> {
    if (!this.config?.accessToken) {
      throw new Error('Telegram not connected');
    }

    const response = await fetch(`https://api.telegram.org/bot${this.config.accessToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: recipient,
        text: message,
      }),
    });

    const data = await response.json();
    return { message_id: data.result?.message_id };
  }
}

class HubSpotDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    });
    return response.ok;
  }

  async createContact(email: string, firstName: string, lastName: string): Promise<{ id: string }> {
    if (!this.config?.accessToken) {
      throw new Error('HubSpot not connected');
    }

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { email, firstname: firstName, lastname: lastName },
      }),
    });

    const data = await response.json();
    return { id: data.id };
  }

  async getContacts(): Promise<{ id: string; email: string; firstName: string; lastName: string }[]> {
    if (!this.config?.accessToken) {
      throw new Error('HubSpot not connected');
    }

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=100', {
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    });

    const data = await response.json();
    return data.results?.map((c: { id: string; properties: { email?: string; firstname?: string; lastname?: string } }) => ({
      id: c.id,
      email: c.properties?.email,
      firstName: c.properties?.firstname,
      lastName: c.properties?.lastname,
    })) || [];
  }
}

class LinearDriver implements IntegrationDriver {
  private config: IntegrationConfig | null = null;

  async connect(config: IntegrationConfig): Promise<void> {
    this.config = config;
  }

  async disconnect(): Promise<void> {
    this.config = null;
  }

  async testConnection(config: IntegrationConfig): Promise<boolean> {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: config.accessToken || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id } }' }),
    });
    const data = await response.json();
    return !data.errors;
  }

  async createIssue(title: string, description: string, teamId?: string): Promise<{ id: string; url: string }> {
    if (!this.config?.accessToken) {
      throw new Error('Linear not connected');
    }

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            url
          }
        }
      }
    `;

    const variables = {
      input: {
        title,
        description,
        teamId: teamId || this.config.settings?.defaultTeamId,
      },
    };

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: this.config.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await response.json();
    return {
      id: data.data?.issueCreate?.issue?.id,
      url: data.data?.issueCreate?.issue?.url,
    };
  }

  async getIssues(): Promise<{ id: string; title: string; state: string }[]> {
    if (!this.config?.accessToken) {
      throw new Error('Linear not connected');
    }

    const query = `
      query {
        issues(first: 100) {
          nodes {
            id
            title
            state {
              name
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: this.config.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    return data.data?.issues?.nodes?.map((i: { id: string; title: string; state: { name: string } }) => ({
      id: i.id,
      title: i.title,
      state: i.state?.name,
    })) || [];
  }
}
