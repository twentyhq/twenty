import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '@sentry/types';
import { Repository } from 'typeorm';

import {
  CreateDialingPlanInput,
  CreatePabxCompanyInput,
  CreatePabxTrunkInput,
  CreateTelephonyInput,
  UpdateRoutingRulesInput,
  UpdateTelephonyInput,
} from 'src/engine/core-modules/telephony/inputs';
import { PabxService } from 'src/engine/core-modules/telephony/services/pabx.service';
import { TelephonyService } from 'src/engine/core-modules/telephony/services/telephony.service';
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

@Resolver(() => Telephony)
export class TelephonyResolver {
  constructor(
    @InjectRepository(Telephony, 'core')
    private readonly telephonyRepository: Repository<Telephony>,
    private readonly telephonyService: TelephonyService,
    private readonly pabxService: PabxService,
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

    console.log('ramalBody: ', ramalBody);

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
      console.log('error da telefonia: ', error);

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

    try {
      const result = await this.pabxService.createCompany(input);

      console.log('result: ', result);

      return {
        success: true,
        message: `Company created successfully: ${input.nome}, id: ${result.data.id}`,
      };
    } catch (error) {
      console.error('Error creating PABX company:', error);

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

    try {
      const result = await this.pabxService.createTrunk(input);

      console.log('result: ', result);

      return {
        success: true,
        message: `Trunk created successfully: ${input.nome}`,
      };
    } catch (error) {
      console.error('Error creating PABX trunk:', error);

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

    try {
      const result = await this.pabxService.createDialingPlan(input);

      return {
        success: true,
        message: `Dialing plan created successfully: ${input.nome}`,
      };
    } catch (error) {
      console.error('Error creating dialing plan:', error);

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
      const result = await this.pabxService.updateRoutingRules(input);

      return {
        success: true,
        message: `Routing rules updated successfully for dialing plan ID: ${input.plano_discagem_id}`,
      };
    } catch (error) {
      console.error('Error updating routing rules:', error);

      return {
        success: false,
        message: `Failed to update routing rules: ${error.message}`,
      };
    }
  }
}
