import { Injectable, InternalServerErrorException } from '@nestjs/common';

import axios from 'axios';

import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';

import { InterIntegration } from './integration/inter-integration.entity';

@Injectable()
export class InterService {
  constructor(
    private readonly interIntegrationService: InterIntegrationService,
  ) {}

  async getAccountBalance(integration: InterIntegration) {
    try {
      // Exemplo de chamada à API do Banco Inter
      const response = await axios.get('https://api.inter.com.br/v1/balance', {
        headers: this.getAuthHeaders(integration),
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get balance from Inter',
      );
    }
  }

  async getAccountInfo(integrationId: string) {
    const integration =
      await this.interIntegrationService.findById(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      const response = await axios.get('https://api.inter.com.br/v1/account', {
        headers: this.getAuthHeaders(integration),
      });

      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to get account info from Inter',
      );
    }
  }

  async syncData(integrationId: string) {
    const integration =
      await this.interIntegrationService.findById(integrationId);

    if (!integration) {
      throw new Error('Integration not found');
    }

    try {
      // Implemente a lógica de sincronização com o Banco Inter
      return true;
    } catch (error) {
      throw new InternalServerErrorException('Failed to sync with Inter');
    }
  }

  private getAuthHeaders(integration: InterIntegration) {
    return {
      'x-inter-client-id': integration.clientId,
      'x-inter-client-secret': integration.clientSecret,
      'Content-Type': 'application/json',
    };
  }

  // Adicione outros métodos para chamadas à API do Inter conforme necessário
}
