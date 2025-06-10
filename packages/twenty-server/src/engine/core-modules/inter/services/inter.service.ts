import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { randomUUID } from 'crypto';

import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { render } from '@react-email/render';
import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';
import { InterBillingChargeFileEmail } from 'twenty-emails';
import { APP_LOCALES } from 'twenty-shared/translations';
import { Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import {
  InterChargeErrorResponse,
  InterChargeRequest,
  InterChargeResponse,
  InterGetChargePDFResponse,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingCharge } from 'src/engine/core-modules/billing/entities/billing-charge.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingPlanKey } from 'src/engine/core-modules/billing/enums/billing-plan-key.enum';
import { EmailService } from 'src/engine/core-modules/email/email.service';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { getNextBusinessDays } from 'src/engine/core-modules/inter/utils/get-next-business-days.util';
import { getPriceFromStripeDecimal } from 'src/engine/core-modules/inter/utils/get-price-from-stripe-decimal.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class InterService {
  private readonly logger = new Logger(InterService.name);
  private readonly interInstance: AxiosInstance;

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingCustomer, 'core')
    private readonly billingCustomerRepository: Repository<BillingCustomer>,
    @InjectRepository(BillingCharge, 'core')
    private readonly billingChargeRepository: Repository<BillingCharge>,
    // TODO: Check if this breaks anything
    @Optional()
    private readonly interIntegrationService: InterIntegrationService,
    private readonly interInstanceService: InterInstanceService,
    private readonly fileUploadService: FileUploadService,
    private readonly emailService: EmailService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.interInstance = this.interInstanceService.getInterAxiosInstance();
  }

  async createBolepixCharge({
    customer,
    planPrice,
    workspaceId,
    locale,
    userEmail,
    planKey,
  }: {
    planKey: BillingPlanKey;
    planPrice: string;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
    userEmail: string;
    customer: BillingCustomer;
  }) {
    await this.validateCustomerChargeData(customer);

    const { document, legalEntity, name, address, city, stateUnity, cep } =
      customer;

    try {
      // TODO: Create a new entity to holde nillin charge intent metadata to be used in inter payment envents
      await this.workspaceRepository.update(workspaceId, {
        interBillingChargeId: workspaceId.slice(0, 15),
      });

      const token = await this.interInstanceService.getOauthToken();

      const chargeCode = randomUUID().replace(/-/g, '').slice(0, 15);

      // TODO: Check if there aready a pending payment for the curent workspace before creating another charge since it will fail anyways if that's the case.
      const response = await this.interInstance.post<
        InterChargeResponse,
        AxiosResponse<InterChargeResponse, InterChargeRequest>,
        InterChargeRequest
      >(
        '/cobranca/v3/cobrancas',
        {
          seuNumero: chargeCode,
          // TODO: Add a number prop in the billing price entity
          valorNominal: getPriceFromStripeDecimal(planPrice).toString(),
          dataVencimento: getNextBusinessDays(5),
          numDiasAgenda: '5',
          pagador: {
            cpfCnpj: document,
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
        this.logger.log(
          `Bolepix code for workspace: ${workspaceId}: ${response.data.codigoSolicitacao}`,
        );

        const bolepixFilePath = await this.getChargePdf({
          interChargeId: response.data.codigoSolicitacao,
          workspaceId,
        });

        await this.billingChargeRepository.upsert(
          {
            chargeCode,
            interBillingChargeFilePath: bolepixFilePath,
            metadata: {
              planKey,
              workspaceId,
              interChargeCode: response.data.codigoSolicitacao,
            },
          },
          {
            conflictPaths: ['chargeCode'],
            skipUpdateIfNoValuesChanged: true,
          },
        );

        await this.billingCustomerRepository.update(customer.id, {
          interBillingChargeId: chargeCode,
          currentInterBankSlipChargeFilePath: bolepixFilePath,
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

  async validateCustomerChargeData(customer: BillingCustomer) {
    const { name, document, legalEntity, address, cep, stateUnity, city } =
      customer;

    const chargeDataArray: (string | null | undefined)[] = [
      name,
      document,
      legalEntity,
      address,
      cep,
      stateUnity,
      city,
    ];

    if (chargeDataArray.includes(null) || chargeDataArray.includes(undefined))
      throw new BillingException(
        `Customer missing inter charge data`,
        BillingExceptionCode.BILLING_MISSING_REQUEST_BODY,
      );
  }

  private getAuthHeaders(integration: InterIntegration) {
    return {
      'x-inter-client-id': integration.clientId,
      'x-inter-client-secret': integration.clientSecret,
      'Content-Type': 'application/json',
    };
  }
}
