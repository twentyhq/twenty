import { Controller, Post, Body, Headers, Logger, HttpCode } from '@nestjs/common';

import { ECommerceService } from './ecommerce.service';

@Controller('rest/ecommerce')
export class ECommerceController {
  private readonly logger = new Logger(ECommerceController.name);

  constructor(private readonly service: ECommerceService) {}

  @Post('webhook/shopify')
  @HttpCode(200)
  async handleWebhookShopify(
    @Headers('x-workspace-id') workspaceId: string,
    @Headers('x-shopify-topic') topic: string,
    @Body() payload: Record<string, unknown>,
  ) {
    this.logger.log(`Shopify webhook: ${topic} (workspace: ${workspaceId})`);
    const order = await this.service.processWebhookShopify(workspaceId, topic, payload);

    return { success: true, orderId: order?.id ?? null };
  }

  @Post('webhook/mercadolibre')
  @HttpCode(200)
  async handleWebhookMercadoLibre(
    @Headers('x-workspace-id') workspaceId: string,
    @Body() payload: { topic: string; resource: string; data: Record<string, unknown> },
  ) {
    this.logger.log(`MercadoLibre webhook: ${payload.topic} (workspace: ${workspaceId})`);
    const order = await this.service.processWebhookMercadoLibre(
      workspaceId,
      payload.topic,
      payload.data,
    );

    return { success: true, orderId: order?.id ?? null };
  }
}
