import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';

import axios, { AxiosResponse, isAxiosError } from 'axios';

import {
  InterChargeErrorResponse,
  InterChargeRequest,
  InterChargeResponse,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { generateRandomCode } from 'src/engine/core-modules/inter/utils/generate-random-code.util';
import { getNextBusinessDays } from 'src/engine/core-modules/inter/utils/get-next-business-days.util';
import { getPriceFromStripeDecimal } from 'src/engine/core-modules/inter/utils/get-price-from-stripe-decimal.util';

@Injectable()
export class InterService {
  private readonly logger = new Logger(InterService.name);

  constructor(
    // TODO: Check if this breaks anything
    @Optional()
    private readonly interIntegrationService: InterIntegrationService,
    private readonly interInstanceService: InterInstanceService,
  ) {}

  async createBolepixBilling({
    planPrice,
    cpfCnpj,
    legalEntity,
    name,
    address,
    city,
    stateUnity,
    cep,
  }: InterCreateChargeDto & {
    planPrice: string;
  }) {
    try {
      const token = await this.interInstanceService.getOauthToken();

      const interInstance = this.interInstanceService.getInterAxiosInstance();

      const response = await interInstance.post<
        InterChargeResponse,
        AxiosResponse<InterChargeResponse, InterChargeRequest>,
        InterChargeRequest
      >(
        '/cobranca/v3/cobrancas',
        {
          seuNumero: generateRandomCode(),
          valorNominal: getPriceFromStripeDecimal(planPrice).toString(),
          dataVencimento: getNextBusinessDays(5),
          numDiasAgenda: '5',
          pagador: {
            cpfCnpj,
            tipoPessoa: legalEntity,
            nome: name,
            endereco: address,
            cidade: city,
            uf: stateUnity,
            cep,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response) {
        // TODO: Fetch bolepix file from code and sent it to the user email
        this.logger.log('Bolepix code: ', response.data.codigoSolicitacao);
      }
    } catch (e) {
      // TODO: Create exception filter for inter API Errors
      const isInterApiError = isAxiosError<InterChargeErrorResponse>(e);

      if (isInterApiError) {
        this.logger.error(
          'Inter Charge Response data: ',
          e.response?.data ?? e,
        );

        if (e.response?.data.violacoes) {
          this.logger.error(e.response?.data.violacoes?.toString());

          (e as unknown as BaseGraphQLError).extensions =
            e.response?.data.violacoes;
        }

        throw new InternalServerErrorException(
          e.response?.data.title || 'Failed to create Bolepix billing',
          {
            description: e.response?.data.detail || 'No details provided',
          },
        );
      }

      this.logger.error('Unexpected error creating Bolepix billing');

      throw new InternalServerErrorException(
        'Failed to create Bolepix billing',
        {
          description: e?.message || 'No error message provided',
        },
      );
    }
  }

  async getAccountBalance(integration: InterIntegration) {
    try {
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

  // Adicione outros métodos para chamadas à API do Inter conforme necessáriot
}
