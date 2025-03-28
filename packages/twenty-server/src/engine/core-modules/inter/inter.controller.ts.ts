import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';

import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterService } from 'src/engine/core-modules/inter/inter.service';

@Controller('inter')
export class InterController {
  private readonly logger = new Logger(InterController.name);

  constructor(
    private readonly interService: InterService,
    private readonly interIntegrationService: InterIntegrationService,
  ) {}

  @Post('/webhook/:id')
  async handleInterWebhook(
    @Param('id') integrationId: string,
    @Body() body: any,
  ) {
    this.logger.log(`Received webhook for integration ${integrationId}`);

    // Implemente a lógica específica para webhooks do Banco Inter
    return { status: 'received', integrationId };
  }

  @Get('/balance/:integrationId')
  async getAccountBalance(@Param('integrationId') integrationId: string) {
    const integration =
      await this.interIntegrationService.findById(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    // Exemplo de chamada à API do Banco Inter
    return this.interService.getAccountBalance(integration);
  }
}
