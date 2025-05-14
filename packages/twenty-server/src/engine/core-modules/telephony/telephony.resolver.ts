import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@sentry/types';
import { Repository } from 'typeorm';

import {
  CreateDialingPlanInput,
  CreatePabxCompanyInput,
  CreatePabxTrunkInput,
  CreateTelephonyInput,
  SetupPabxEnvironmentInput,
  UpdateRoutingRulesInput,
  UpdateTelephonyInput,
} from 'src/engine/core-modules/telephony/inputs';
import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TelephonyService } from 'src/engine/core-modules/telephony/services/telephony.service';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';

import {
  Campaign,
  Telephony,
  TelephonyCallFlow,
  TelephonyDialingPlan,
  TelephonyDids,
  TelephonyExtension,
} from './telephony.entity';

import { PabxCompanyResponseType } from './types/Create/PabxCompanyResponse.type';
import { PabxDialingPlanResponseType } from './types/Create/PabxDialingPlanResponse.type';
import { PabxTrunkResponseType } from './types/Create/PabxTrunkResponse.type';
import { UpdateRoutingRulesResponseType } from './types/Create/UpdateRoutingRulesResponse.type';
import { SetupPabxEnvironmentResponseType } from './types/SetupPabxEnvironmentResponse.type';

@Resolver(() => Telephony)
export class TelephonyResolver {
  constructor(
    @InjectRepository(Telephony, 'core')
    private readonly telephonyRepository: Repository<Telephony>,
    private readonly telephonyService: TelephonyService,
    private readonly pabxService: PabxService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  getRamalBody(input: CreateTelephonyInput | UpdateTelephonyInput) {
    return {
      dados: {
        tipo: input.type ? parseInt(input.type) : 1,
        nome: input.extensionName,
        numero: input.numberExtension,
        senha_sip: input.SIPPassword,
        caller_id_externo: input.callerExternalID,
        cliente_id: this.pabxService.LIST_BODY.cliente_id,
        grupo_ramais: '1',
        centro_custo: '1',
        dupla_autenticacao_ip_permitido: '1',
        dupla_autenticacao_mascara: '1',
        grupo_musica_espera: '1',
        plano_discagem_id: input.dialingPlan ? parseInt(input.dialingPlan) : 1,
        puxar_chamadas: input.pullCalls ? parseInt(input.pullCalls) : 0,
        habilitar_timers: 0,
        habilitar_blf: 0,
        escutar_chamadas: input.listenToCalls ? 1 : 0,
        gravar_chamadas: input.recordCalls ? 1 : 0,
        bloquear_ramal: input.blockExtension ? 1 : 0,
        codigo_area: input.areaCode ? parseInt(input.areaCode) : 0,
        habilitar_dupla_autenticacao: 0,
        habilitar_caixa_postal: input.enableMailbox ? 1 : 0,
        caixa_postal_email: input.emailForMailbox
          ? input.emailForMailbox
          : 'default@default.com',
        encaminhar_todas_chamadas: {
          encaminhamento_tipo: input.fowardAllCalls
            ? parseInt(input.fowardAllCalls)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardAllCalls || '0',
            input,
            true,
          ),
          encaminhamento_destinos: [
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding1 || '0'),
              encaminhamento_destino: input.advancedFowarding1Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding2 || '0'),
              encaminhamento_destino: input.advancedFowarding2Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding3 || '0'),
              encaminhamento_destino: input.advancedFowarding3Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding4 || '0'),
              encaminhamento_destino: input.advancedFowarding4Value || '',
            },
            {
              encaminhamento_tipo: parseInt(input.advancedFowarding5 || '0'),
              encaminhamento_destino: input.advancedFowarding5Value || '',
            },
          ],
        },
        encaminhar_offline_sem_atendimento: {
          encaminhamento_tipo: input.fowardOfflineWithoutService
            ? parseInt(input.fowardOfflineWithoutService)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardOfflineWithoutService || '0',
            input,
            true,
          ),
        },
        encaminhar_ocupado_indisponivel: {
          encaminhamento_tipo: input.fowardBusyNotAvailable
            ? parseInt(input.fowardBusyNotAvailable)
            : 0,
          encaminhamento_destino: this.switchFowardOptions(
            input.fowardBusyNotAvailable || '0',
            input,
            false,
          ),
        },
      },
    };
  }

  switchFowardOptions(
    foward: string,
    options: CreateTelephonyInput | UpdateTelephonyInput,
    allCallsOrOffline: boolean,
  ) {
    switch (foward) {
      case '1':
        return allCallsOrOffline
          ? options.extensionAllCallsOrOffline
          : options.extensionBusy;
      case '8':
        return allCallsOrOffline
          ? options.externalNumberAllCallsOrOffline
          : options.externalNumberBusy;
      case '9':
        return allCallsOrOffline
          ? options.destinyMailboxAllCallsOrOffline
          : options.destinyMailboxBusy;
      default:
        return '';
    }
  }

  @Mutation(() => Telephony)
  async createTelephony(
    @AuthUser() { id: userId }: User,
    @Args('createTelephonyInput') createTelephonyInput: CreateTelephonyInput,
  ): Promise<Telephony | undefined> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!createTelephonyInput.workspaceId) {
      throw new Error('Workspace id not found');
    }

    const ramalBody = this.getRamalBody(createTelephonyInput);

    try {
      const createdRamal = await this.pabxService.createExtention(ramalBody);

      if (createdRamal) {
        const result = await this.telephonyService.createTelehony({
          ...createTelephonyInput,
          ramal_id: createdRamal.data.id,
        });

        await this.telephonyService.setExtensionNumberInWorkspaceMember(
          createTelephonyInput.workspaceId,
          createTelephonyInput.memberId,
          createTelephonyInput.numberExtension,
        );

        return result;
      }
    } catch (error) {
      return error;
    }
  }

  @Query(() => [Telephony])
  async findAllTelephony(
    @AuthUser() { id: userId }: User,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<Telephony[]> {
    if (!userId) {
      throw new Error('User id not found');
    }

    return await this.telephonyService.findAll({ workspaceId });
  }

  @Mutation(() => Telephony)
  async updateTelephony(
    @AuthUser() { id: userId }: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('updateTelephonyInput') updateTelephonyInput: UpdateTelephonyInput,
  ): Promise<Telephony> {
    if (!userId) {
      throw new Error('User id not found');
    }

    const telephony = await this.telephonyService.findOne({
      id,
    });

    if (!telephony) {
      throw new Error('Telephony not found');
    }

    try {
      const ramalBody = {
        dados: {
          ...this.getRamalBody(updateTelephonyInput).dados,
          ramal_id: telephony.ramal_id,
        },
      };

      const updatedRamal = await this.pabxService.updateExtention(ramalBody);

      if (!updatedRamal) {
        throw new Error('Error updating ramal');
      }

      await this.telephonyService.setExtensionNumberInWorkspaceMember(
        telephony.workspace.id,
        telephony.memberId,
        updateTelephonyInput.numberExtension || telephony.numberExtension,
      );

      const result = await this.telephonyService.updateTelephony({
        id,
        data: { ...updateTelephonyInput, ramal_id: telephony.ramal_id },
      });

      return result;
    } catch (error) {
      return error;
    }
  }

  @Query(() => [TelephonyExtension], { nullable: true })
  async getAllExtensions(): Promise<TelephonyExtension[]> {
    const extensions = await this.pabxService.listExtentions();

    return extensions.data.dados;
  }

  @Query(() => [TelephonyDialingPlan], { nullable: true })
  async getTelephonyPlans(): Promise<TelephonyDialingPlan[]> {
    const extensions = await this.pabxService.listDialingPlans();

    return extensions.data.dados;
  }

  @Query(() => [TelephonyDids], { nullable: true })
  async getTelephonyDids(): Promise<TelephonyDids[]> {
    const extensions = await this.pabxService.listDids();

    return extensions.data.dados;
  }

  @Query(() => [Campaign], { nullable: true })
  async getTelephonyURAs(): Promise<Campaign[]> {
    const uras = await this.pabxService.listCampaigns();

    const data = uras.data.dados.map((ura: Campaign) => {
      const { campanha_id, cliente_id, nome } = ura;

      return { campanha_id, cliente_id, nome };
    });

    return data;
  }

  @Query(() => [TelephonyCallFlow], { nullable: true })
  async getTelephonyCallFlows(): Promise<TelephonyCallFlow[]> {
    const callFlows = await this.pabxService.listIntegrationFlows();

    const data = callFlows.data.dados.map((ura: TelephonyCallFlow) => {
      const { fluxo_chamada_id, fluxo_chamada_nome } = ura;

      return { fluxo_chamada_id, fluxo_chamada_nome };
    });

    return data;
  }

  @Query(() => TelephonyExtension, { nullable: true })
  async getUserSoftfone(
    @Args('extNum', { type: () => String }) extNum: string,
  ): Promise<TelephonyExtension> {
    const extensions = await this.pabxService.listExtentions({
      numero: extNum,
    });

    return extensions.data.dados[0];
  }

  @Mutation(() => Boolean)
  async deleteTelephony(
    @AuthUser() { id: userId }: User,
    @Args('telephonyId', { type: () => ID }) telephonyId: string,
  ): Promise<boolean> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!telephonyId) {
      throw new Error('Agent id not found');
    }

    const telephonyToDelete = await this.telephonyService.findOne({
      id: telephonyId,
    });

    if (!telephonyToDelete) {
      throw new Error('Telephony not found');
    }

    await this.telephonyService.removeAgentIdInWorkspaceMember(
      telephonyToDelete.workspace.id,
      telephonyToDelete.memberId,
    );

    const result = await this.telephonyService.delete({ id: telephonyId });

    return result;
  }

  @Mutation(() => PabxCompanyResponseType, { name: 'createPabxCompany' })
  async createPabxCompany(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreatePabxCompanyInput,
  ): Promise<PabxCompanyResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createCompany(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxCompanyId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Company created successfully: ${input.nome}, id: ${result.data.id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create company: ${error.message}`,
      };
    }
  }

  @Mutation(() => PabxTrunkResponseType, { name: 'createPabxTrunk' })
  async createPabxTrunk(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreatePabxTrunkInput,
  ): Promise<PabxTrunkResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createTrunk(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxTrunkId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Trunk created successfully: ${input.nome}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create trunk: ${error.message}`,
      };
    }
  }

  @Mutation(() => PabxDialingPlanResponseType, { name: 'createDialingPlan' })
  async createDialingPlan(
    @AuthUser() { id: userId }: User,
    @Args('input') input: CreateDialingPlanInput,
  ): Promise<PabxDialingPlanResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace id not found in input');
    }

    try {
      const result = await this.pabxService.createDialingPlan(input);

      if (result && result.data && result.data.id) {
        await this.workspaceService.updateWorkspaceById({
          payload: {
            id: input.workspaceId,
            pabxDialingPlanId: result.data.id,
          },
        });
      }

      return {
        success: true,
        message: `Dialing plan created successfully: ${input.nome}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create dialing plan: ${error.message}`,
      };
    }
  }

  @Mutation(() => UpdateRoutingRulesResponseType, {
    name: 'updateRoutingRules',
  })
  async updateRoutingRules(
    @AuthUser() { id: userId }: User,
    @Args('input') input: UpdateRoutingRulesInput,
  ): Promise<UpdateRoutingRulesResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    try {
      await this.pabxService.updateRoutingRules(input);

      return {
        success: true,
        message: `Routing rules updated successfully for dialing plan ID: ${input.plano_discagem_id}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update routing rules: ${error.message}`,
      };
    }
  }

  @Mutation(() => SetupPabxEnvironmentResponseType, {
    name: 'setupPabxEnvironment',
  })
  async setupPabxEnvironment(
    @AuthUser() { id: userId }: User,
    @Args('input') input: SetupPabxEnvironmentInput,
  ): Promise<SetupPabxEnvironmentResponseType> {
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!input.workspaceId) {
      throw new Error('Workspace ID is required in input');
    }

    let companyId: number | undefined;
    let trunkAPIId: number | undefined;
    let dialingPlanAPIId: number | undefined;

    try {
      const companyInput: CreatePabxCompanyInput = {
        ...input.companyDetails,
        workspaceId: input.workspaceId,
      };

      const companyResult = await this.pabxService.createCompany(companyInput);

      companyId = companyResult.data.id;

      if (!companyResult || !companyResult.data || !companyId) {
        throw new Error('Failed to create PABX company or retrieve ID.');
      }

      const trunkInput: CreatePabxTrunkInput = {
        ...input.trunkDetails,
        cliente_id: companyId,
        workspaceId: input.workspaceId,
      };

      const trunkResult = await this.pabxService.createTrunk(trunkInput);

      trunkAPIId = trunkResult.data.id;

      if (!trunkResult || !trunkResult.data || !trunkAPIId) {
        throw new Error('Failed to create PABX trunk or retrieve ID.');
      }

      // Step 3: Create Dialing Plan
      const dialingPlanInput: CreateDialingPlanInput = {
        ...input.dialingPlanDetails,
        cliente_id: companyId,
        workspaceId: input.workspaceId,
      };

      const dialingPlanResult =
        await this.pabxService.createDialingPlan(dialingPlanInput);

      dialingPlanAPIId = dialingPlanResult.data.id;

      if (!dialingPlanResult || !dialingPlanResult.data || !dialingPlanAPIId) {
        throw new Error('Failed to create PABX dialing plan or retrieve ID.');
      }

      await this.workspaceService.updateWorkspaceById({
        payload: {
          id: input.workspaceId,
          pabxCompanyId: companyId,
          pabxTrunkId: trunkAPIId,
          pabxDialingPlanId: dialingPlanAPIId,
        },
      });

      // Inject trunkAPIId into all routing rules
      const routingRulesDataWithTrunkId = {
        ...input.routingRulesData,
        regioes: input.routingRulesData.regioes.map((region) => ({
          ...region,
          roteamentos: region.roteamentos.map((rule) => ({
            ...rule,
            tronco_id: trunkAPIId,
          })),
        })),
      };

      const routingRulesInput: UpdateRoutingRulesInput = {
        plano_discagem_id: dialingPlanAPIId,
        cliente_id: companyId,
        dados: routingRulesDataWithTrunkId,
      };

      await this.pabxService.updateRoutingRules(routingRulesInput);

      return {
        success: true,
        message: 'PABX environment set up successfully.',
        companyId: companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanAPIId,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to set up PABX environment: ${error.message}`,
        companyId,
        trunkId: trunkAPIId,
        dialingPlanId: dialingPlanAPIId,
      };
    }
  }
}
