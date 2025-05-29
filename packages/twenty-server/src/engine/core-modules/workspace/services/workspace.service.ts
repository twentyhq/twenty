import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import assert from 'assert';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { CustomDomainService } from 'src/engine/core-modules/domain-manager/services/custom-domain.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  FileWorkspaceFolderDeletionJob,
  FileWorkspaceFolderDeletionJobData,
} from 'src/engine/core-modules/file/jobs/file-workspace-folder-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ActivateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/activate-workspace-input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/default-feature-flags';
import { SoapClientService } from 'src/modules/soap-client/soap-client.service';
import { extractVersionMajorMinorPatch } from 'src/utils/version/extract-version-major-minor-patch';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class WorkspaceService extends TypeOrmQueryService<Workspace> {
  private readonly featureLookUpKey = BillingEntitlementKey.CUSTOM_DOMAIN;
  protected readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly workspaceManagerService: WorkspaceManagerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly billingSubscriptionService: BillingSubscriptionService,
    private readonly billingService: BillingService,
    private readonly userWorkspaceService: UserWorkspaceService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly domainManagerService: DomainManagerService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
    private readonly customDomainService: CustomDomainService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly pabxService: PabxService,
    private readonly soapClientService: SoapClientService,
  ) {
    super(workspaceRepository);
  }

  private async isCustomDomainEnabled(workspaceId: string) {
    const isCustomDomainBillingEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        this.featureLookUpKey,
      );

    if (!isCustomDomainBillingEnabled) {
      throw new WorkspaceException(
        `No entitlement found for this workspace`,
        WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED,
      );
    }
  }

  private async validateSubdomainUpdate(newSubdomain: string) {
    const subdomainAvailable = await this.isSubdomainAvailable(newSubdomain);

    if (
      !subdomainAvailable ||
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN') === newSubdomain
    ) {
      throw new WorkspaceException(
        'Subdomain already taken',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }
  }

  private async setCustomDomain(workspace: Workspace, customDomain: string) {
    await this.isCustomDomainEnabled(workspace.id);

    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { customDomain },
    });

    if (existingWorkspace && existingWorkspace.id !== workspace.id) {
      throw new WorkspaceException(
        'Domain already taken',
        WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN,
      );
    }

    if (
      customDomain &&
      workspace.customDomain !== customDomain &&
      isDefined(workspace.customDomain)
    ) {
      await this.customDomainService.updateCustomDomain(
        workspace.customDomain,
        customDomain,
      );
    }

    if (
      customDomain &&
      workspace.customDomain !== customDomain &&
      !isDefined(workspace.customDomain)
    ) {
      await this.customDomainService.registerCustomDomain(customDomain);
    }
  }

  async updateWorkspaceById({
    payload,
    userWorkspaceId,
    apiKey,
  }: {
    payload: Partial<Workspace> & { id: string };
    userWorkspaceId?: string;
    apiKey?: string;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.id,
    });

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    await this.validateSecurityPermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
    });

    await this.validateWorkspacePermissions({
      payload,
      userWorkspaceId,
      workspaceId: workspace.id,
      apiKey,
      workspaceActivationStatus: workspace.activationStatus,
    });

    if (payload.subdomain && workspace.subdomain !== payload.subdomain) {
      await this.validateSubdomainUpdate(payload.subdomain);
    }

    let customDomainRegistered = false;

    if (payload.customDomain === null && isDefined(workspace.customDomain)) {
      await this.customDomainService.deleteCustomHostnameByHostnameSilently(
        workspace.customDomain,
      );
    }

    if (
      payload.customDomain &&
      workspace.customDomain !== payload.customDomain
    ) {
      await this.setCustomDomain(workspace, payload.customDomain);
      customDomainRegistered = true;
    }

    const authProvidersBySystem = {
      google: this.twentyConfigService.get('AUTH_GOOGLE_ENABLED'),
      password: this.twentyConfigService.get('AUTH_PASSWORD_ENABLED'),
      microsoft: this.twentyConfigService.get('AUTH_MICROSOFT_ENABLED'),
    };

    if (payload.isGoogleAuthEnabled && !authProvidersBySystem.google) {
      throw new WorkspaceException(
        'Google auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isMicrosoftAuthEnabled && !authProvidersBySystem.microsoft) {
      throw new WorkspaceException(
        'Microsoft auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }
    if (payload.isPasswordAuthEnabled && !authProvidersBySystem.password) {
      throw new WorkspaceException(
        'Password auth is not enabled in the system.',
        WorkspaceExceptionCode.ENVIRONMENT_VAR_NOT_ENABLED,
      );
    }

    try {
      return await this.workspaceRepository.save({
        ...workspace,
        ...payload,
      });
    } catch (error) {
      // revert custom domain registration on error
      if (payload.customDomain && customDomainRegistered) {
        this.customDomainService
          .deleteCustomHostnameByHostnameSilently(payload.customDomain)
          .catch((err) => {
            this.exceptionHandlerService.captureExceptions([err]);
          });
      }
      throw error;
    }
  }

  async activateWorkspace(
    user: User,
    workspace: Workspace,
    data: ActivateWorkspaceInput,
  ) {
    if (!data.displayName || !data.displayName.length) {
      throw new BadRequestException("'displayName' not provided");
    }

    if (
      workspace.activationStatus === WorkspaceActivationStatus.ONGOING_CREATION
    ) {
      throw new Error('Workspace is already being created');
    }

    if (
      workspace.activationStatus !== WorkspaceActivationStatus.PENDING_CREATION
    ) {
      throw new Error('Workspace is not pending creation');
    }

    await this.workspaceRepository.update(workspace.id, {
      activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
      creatorEmail: user.email,
    });

    await this.featureFlagService.enableFeatureFlags(
      DEFAULT_FEATURE_FLAGS,
      workspace.id,
    );

    await this.workspaceManagerService.init({
      workspaceId: workspace.id,
      userId: user.id,
    });
    await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

    const appVersion = this.twentyConfigService.get('APP_VERSION');

    await this.workspaceRepository.update(workspace.id, {
      displayName: data.displayName,
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: extractVersionMajorMinorPatch(appVersion),
    });

    const stripeFeatureFlag = this.featureFlagRepository.create({
      key: FeatureFlagKey.IsStripeIntegrationEnabled,
      workspaceId: workspace.id,
      value: true,
    });

    const techPrefix = this.generateTechPrefix();

    const clienteData = {
      nome: user.email,
      login: user.email,
      senha: user.email,
      revenda: 0,
      max_cps: 10,
      max_chamadas_simult: 5,
      prepaid_mode: 1,
      cota_diaria_limite: 100,
      cota_mensal_limite: 1000,
      franquia_minima: 50,
      cobranca_extra_mensal: 0,
      cota_diaria_consumo: 0,
      cota_mensal_consumo: 0,
      tipo_cobranca: 3,
      dia_cobranca: 5,
      bloqueia_prejuizo: 0,
      expira_saldo: 0,
      bloqueia_fixo: 0,
      bloqueia_movel: 0,
      bloqueia_internacional: 0,
    };

    const contaVoipData = {
      numero: techPrefix,
      dominio: 'log.kvoip.com.br',
      senha: this.generateRandomPassword(),
      postpaid: true,
      aviso_saldo_habilita: 1,
      aviso_saldo_valor: 1,
      assinatura_valor: 1,
      assinatura_dia: 1,
      saldo: 0,
    };

    const ipData = {
      ip: '186.209.119.150', // 186.209.119.150 / 192.168.1.88
      pospago: true,
      compartilhado: 1,
      tech_prefix: techPrefix,
      monitora_ping: false,
      tabela_roteamento_id: 22,
      tabela_venda_id: 177,
      notificacao_saldo_habilitado: true,
      notificacao_saldo_valor: 100.5,
      local: 11,
    };

    try {
      const soapResult = await this.soapClientService.createCompleteClient(
        clienteData,
        contaVoipData,
        ipData,
        22,
        177,
        11,
      );

      this.logger.log('SOAP client setup completed:', soapResult);

      await this.setupPabxEnvironment(
        workspace,
        user,
        data.displayName,
        techPrefix,
      );

      await this.featureFlagRepository.save(stripeFeatureFlag);

      return await this.workspaceRepository.findOneBy({
        id: workspace.id,
      });
    } catch (error) {
      this.logger.error('Error in workspace activation:', error);
      throw error;
    }
  }

  async setupPabxEnvironment(
    workspace: Workspace,
    user: User,
    workspaceName: string,
    techPrefix: string,
  ) {
    this.logger.log(
      'Setting up PABX environment for workspace: ',
      workspace.id,
    );

    try {
      const companyInput = {
        tipo: 1,
        login: user.email,
        senha: user.email,
        nome: workspaceName,
        qtd_ramais_max_pabx: 5,
        qtd_ramais_max_pa: 0,
        salas_conf_num_max: 1,
        workspaceId: workspace.id,
        email_cliente: user.email,
        espaco_disco: 300,
        max_chamadas_simultaneas: 1,
        faixa_min: 1000,
        faixa_max: 3000,
        prefixo: this.generateRandomCompanyPrefixBasedOnEmail(user.email),
        habilita_prefixo_sainte: 0,
        acao_limite_espaco: 2,
      };

      const companyResult = await this.pabxService.createCompany(companyInput);

      const companyId = companyResult.data.id;

      if (!companyId) {
        throw new Error('Failed to create PABX company or retrieve ID.');
      }

      const trunkInput = {
        cliente_id: companyId,
        tronco_id: 0,
        nome: 'TroncoPadrao',
        endereco: 'log.kvoip.com.br',
        qtd_digitos_cortados: 0,
        insere_digitos: techPrefix,
        autentica_user_pass: 0,
        host_dinamico: 0,
        tarifas: [
          {
            regiao_id: 1,
            tarifa: 0,
            fracionamento: '4/30/6',
          },
          {
            regiao_id: 2,
            tarifa: 0,
            fracionamento: '4/30/6',
          },
          {
            regiao_id: 3,
            tarifa: 0,
            fracionamento: '4/30/6',
          },
        ],
      };

      const trunkResult = await this.pabxService.createTrunk(trunkInput);

      const trunkAPIId = trunkResult.data.id;

      if (!trunkAPIId) {
        throw new Error('Failed to create PABX trunk or retrieve ID.');
      }

      const dialingPlanInput = {
        plano_discagem_id: 0,
        nome: 'PlanoPadrao',
        cliente_id: companyId,
        workspaceId: workspace.id,
      };

      const dialingPlanResult =
        await this.pabxService.createDialingPlan(dialingPlanInput);

      const dialingPlanAPIId = dialingPlanResult.data.id;

      if (!dialingPlanAPIId) {
        throw new Error('Failed to create PABX dialing plan or retrieve ID.');
      }

      await this.workspaceRepository.update(workspace.id, {
        pabxCompanyId: companyId,
        pabxTrunkId: trunkAPIId,
        pabxDialingPlanId: dialingPlanAPIId,
      });

      const routingRulesData = {
        regioes: [
          {
            regiao_id: 1,
            regiao_nome: 'RegiaoPadrao',
            roteamentos: [
              {
                prioridade: 1,
                tronco_id: trunkAPIId,
                tronco_nome: 'TroncoPadrao',
              },
            ],
          },
        ],
      };

      const routingRulesInput = {
        plano_discagem_id: dialingPlanAPIId,
        cliente_id: companyId,
        dados: routingRulesData,
      };

      await this.pabxService.updateRoutingRules(routingRulesInput);

      this.logger.log('PABX environment set up successfully.');

      return {
        success: true,
        message: 'PABX environment set up successfully.',
        companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanAPIId,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up PABX environment: ${error.message}`,
        companyId: undefined,
        trunkId: undefined,
        dialingPlanId: undefined,
      };
    }
  }

  async deleteMetadataSchemaCacheAndUserWorkspace(workspace: Workspace) {
    await this.userWorkspaceRepository.delete({ workspaceId: workspace.id });

    if (this.billingService.isBillingEnabled()) {
      await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
    }

    await this.workspaceManagerService.delete(workspace.id);

    return workspace;
  }

  async deleteWorkspace(id: string, softDelete = false) {
    //TODO: delete all logs when #611 closed

    this.logger.log(
      `${softDelete ? 'Soft' : 'Hard'} deleting workspace ${id} ...`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    assert(workspace, 'Workspace not found');

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        workspaceId: id,
      },
      withDeleted: true,
    });

    for (const userWorkspace of userWorkspaces) {
      await this.handleRemoveWorkspaceMember(
        id,
        userWorkspace.userId,
        softDelete,
      );
    }
    this.logger.log(`workspace ${id} user workspaces deleted`);

    await this.workspaceCacheStorageService.flush(
      workspace.id,
      workspace.metadataVersion,
    );
    this.logger.log(`workspace ${id} cache flushed`);

    if (softDelete) {
      if (this.billingService.isBillingEnabled()) {
        await this.billingSubscriptionService.deleteSubscriptions(workspace.id);
      }

      await this.workspaceRepository.softDelete({ id });

      this.logger.log(`workspace ${id} soft deleted`);

      return workspace;
    }

    await this.deleteMetadataSchemaCacheAndUserWorkspace(workspace);

    await this.messageQueueService.add<FileWorkspaceFolderDeletionJobData>(
      FileWorkspaceFolderDeletionJob.name,
      { workspaceId: id },
    );

    if (workspace.customDomain) {
      await this.customDomainService.deleteCustomHostnameByHostnameSilently(
        workspace.customDomain,
      );
      this.logger.log(`workspace ${id} custom domain deleted`);
    }

    await this.workspaceRepository.delete(id);

    this.logger.log(`workspace ${id} hard deleted`);

    return workspace;
  }

  async handleRemoveWorkspaceMember(
    workspaceId: string,
    userId: string,
    softDelete = false,
  ) {
    if (softDelete) {
      await this.userWorkspaceRepository.softDelete({
        userId,
        workspaceId,
      });
    } else {
      await this.userWorkspaceRepository.delete({
        userId,
        workspaceId,
      });
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: {
        userId,
      },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.softDelete(userId);
    }
  }

  async isSubdomainAvailable(subdomain: string) {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: subdomain },
    });

    return !existingWorkspace;
  }

  async checkCustomDomainValidRecords(workspace: Workspace) {
    if (!workspace.customDomain) return;

    const customDomainDetails =
      await this.customDomainService.getCustomDomainDetails(
        workspace.customDomain,
      );

    if (!customDomainDetails) return;

    const isCustomDomainWorking =
      this.domainManagerService.isCustomDomainWorking(customDomainDetails);

    if (workspace.isCustomDomainEnabled !== isCustomDomainWorking) {
      workspace.isCustomDomainEnabled = isCustomDomainWorking;
      await this.workspaceRepository.save(workspace);

      const analytics = this.auditService.createContext({
        workspaceId: workspace.id,
      });

      analytics.insertWorkspaceEvent(
        workspace.isCustomDomainEnabled
          ? CUSTOM_DOMAIN_ACTIVATED_EVENT
          : CUSTOM_DOMAIN_DEACTIVATED_EVENT,
        {},
      );
    }

    return customDomainDetails;
  }

  private async validateSecurityPermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
  }: {
    payload: Partial<Workspace>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
  }) {
    if (
      'isGoogleAuthEnabled' in payload ||
      'isMicrosoftAuthEnabled' in payload ||
      'isPasswordAuthEnabled' in payload ||
      'isPublicInviteLinkEnabled' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          setting: SettingPermissionType.SECURITY,
          workspaceId: workspaceId,
          isExecutedByApiKey: isDefined(apiKey),
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }

  private async validateWorkspacePermissions({
    payload,
    userWorkspaceId,
    workspaceId,
    apiKey,
    workspaceActivationStatus,
  }: {
    payload: Partial<Workspace>;
    userWorkspaceId?: string;
    workspaceId: string;
    apiKey?: string;
    workspaceActivationStatus: WorkspaceActivationStatus;
  }) {
    if (
      'displayName' in payload ||
      'subdomain' in payload ||
      'customDomain' in payload ||
      'logo' in payload
    ) {
      if (!userWorkspaceId) {
        throw new Error('Missing userWorkspaceId in authContext');
      }

      if (
        workspaceActivationStatus === WorkspaceActivationStatus.PENDING_CREATION
      ) {
        return;
      }

      const userHasPermission =
        await this.permissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId,
          workspaceId,
          setting: SettingPermissionType.WORKSPACE,
          isExecutedByApiKey: isDefined(apiKey),
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }

  private generateRandomPassword() {
    return Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(8, '0');
  }

  private generateTechPrefix() {
    return Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, '0');
  }

  private generateRandomCompanyPrefixBasedOnEmail(email: string) {
    const formatedEmail = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    let randomCompanyPrefix = '';
    const letters = formatedEmail.replace(/[^a-zA-Z]/g, '');

    if (letters.length > 0) {
      const randomLetterIndex = Math.floor(Math.random() * letters.length);

      randomCompanyPrefix = letters[randomLetterIndex];
    } else {
      randomCompanyPrefix = 'A';
    }
    for (let i = 1; i < 7; i++) {
      if (letters.length > 0) {
        const randomIndex = Math.floor(Math.random() * letters.length);

        randomCompanyPrefix += letters[randomIndex];
      } else {
        randomCompanyPrefix += 'A';
      }
    }

    return randomCompanyPrefix;
  }
}
