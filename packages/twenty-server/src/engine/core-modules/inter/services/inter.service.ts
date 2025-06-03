import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';
import { Repository } from 'typeorm';

import {
  InterChargeErrorResponse,
  InterChargeRequest,
  InterChargeResponse,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InterCreateChargeDto } from 'src/engine/core-modules/inter/dtos/inter-create-charge.dto';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterGetChargePDFResponse } from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { getNextBusinessDays } from 'src/engine/core-modules/inter/utils/get-next-business-days.util';
import { getPriceFromStripeDecimal } from 'src/engine/core-modules/inter/utils/get-price-from-stripe-decimal.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { InterBillingChargeFileEmail } from 'twenty-emails';
import { APP_LOCALES } from 'twenty-shared/translations';

@Injectable()
export class InterService {
  private readonly logger = new Logger(InterService.name);
  private readonly interInstance: AxiosInstance;

  constructor(
    // TODO: Check if this breaks anything
    @Optional()
    private readonly interIntegrationService: InterIntegrationService,
    private readonly interInstanceService: InterInstanceService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.interInstance = this.interInstanceService.getInterAxiosInstance();
  }

  async createBolepixBilling({
    planPrice,
    cpfCnpj,
    legalEntity,
    name,
    address,
    city,
    stateUnity,
    cep,
    workspaceId,
    locale,
    userEmail,
  }: InterCreateChargeDto & {
    planPrice: string;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
    userEmail: string;
  }) {
    try {
      const token = await this.interInstanceService.getOauthToken();

      const response = await this.interInstance.post<
        InterChargeResponse,
        AxiosResponse<InterChargeResponse, InterChargeRequest>,
        InterChargeRequest
      >(
        '/cobranca/v3/cobrancas',
        {
          seuNumero: workspaceId.slice(0, 15),
          // TODO: Add a number prop in the billing price entity
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
        // TODO: We should move this to the queue system
        this.logger.log('Bolepix code: ', response.data.codigoSolicitacao);

        const bolepixFilePath = await this.getChargePdf({
          interChargeId: response.data.codigoSolicitacao,
          workspaceId,
        });

        await this.workspaceRepository.update(workspaceId, {
          interBillingChargeId: workspaceId.slice(0, 15),
          interBillingChargeFilePath: bolepixFilePath,
        });

        const baseUrl = this.twentyConfigService.get('SERVER_URL');

        const emailTemplate = InterBillingChargeFileEmail({
          duration: '5 Buisiness days',
          link: `${baseUrl}/files/${bolepixFilePath}`,
          locale,
        });

        const html = await render(emailTemplate, { pretty: true });
        const text = await render(emailTemplate, { plainText: true });

        i18n.activate(locale);

        this.logger.log(`Sengind email to ${userEmail}`);
        this.emailService.send({
          from: `${this.twentyConfigService.get(
            'EMAIL_FROM_NAME',
          )} <${this.twentyConfigService.get('EMAIL_FROM_ADDRESS')}>`,
          to: userEmail,
          subject: t`Inter Bilepix Billing Charge`,
          text,
          html,
        });
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

  async getChargePdf({
    interChargeId,
    workspaceId,
  }: {
    workspaceId: string;
    interChargeId: string;
  }): Promise<string> {
    const token = await this.interInstanceService.getOauthToken();

    const response = await this.interInstance.get<InterGetChargePDFResponse>(
      `/cobranca/v3/cobrancas/${interChargeId}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const fileFolder = FileFolder.InterCharge;

    // TODO: Check if there is are any existing files for this workspace and remove them before uploading a new one
    const { path } = await this.fileUploadService.uploadFile({
      file: Buffer.from(response.data.pdf, 'base64'),
      fileFolder,
      workspaceId,
      filename: `bolepix-${interChargeId}-${workspaceId}.pdf`,
      mimeType: 'application/pdf',
    });

    return path;
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
}
