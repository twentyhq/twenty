import { Controller, Post, Body, Get, Param, Delete, Headers, Req } from '@nestjs/common';
import { Request } from 'express';

import { IntegrationProvider } from './enums/integration-provider.enum';
import { IntegrationService } from './services/integration.service';

class ConnectIntegrationDto {
  provider: IntegrationProvider;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  settings?: Record<string, unknown>;
}

class TestConnectionDto {
  provider: IntegrationProvider;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
  settings?: Record<string, unknown>;
}

class SendMessageDto {
  provider: IntegrationProvider;
  message: string;
  recipient: string;
}

@Controller('integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post('connect')
  async connect(@Body() dto: ConnectIntegrationDto) {
    const success = await this.integrationService.testConnection(dto);
    return { success, provider: dto.provider };
  }

  @Post('test')
  async test(@Body() dto: TestConnectionDto) {
    const success = await this.integrationService.testConnection(dto);
    return { connected: success, provider: dto.provider };
  }

  @Post('send')
  async sendMessage(@Body() dto: SendMessageDto) {
    const driver = this.integrationService.getDriver(dto.provider);
    
    if (!driver.sendMessage) {
      return { error: 'Provider does not support sending messages' };
    }

    const result = await driver.sendMessage(dto.message, dto.recipient);
    return { success: true, result };
  }

  @Post('webhook/:provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: unknown,
    @Headers() headers: Record<string, string>,
  ) {
    console.log(`Webhook received from ${provider}:`, payload);
    return { received: true };
  }

  @Get(':provider/status')
  async getStatus(@Param('provider') provider: string) {
    return { provider, status: 'active' };
  }

  @Delete(':provider')
  async disconnect(@Param('provider') provider: string) {
    const providerEnum = provider.toUpperCase() as IntegrationProvider;
    await this.integrationService.disconnect(providerEnum);
    return { disconnected: true, provider: providerEnum };
  }
}
