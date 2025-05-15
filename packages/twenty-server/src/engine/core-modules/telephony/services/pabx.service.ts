import { Injectable, Logger } from '@nestjs/common';

import https from 'https';

import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { PabxServiceInterface } from 'src/engine/core-modules/telephony/interfaces/pabx.interface';

import {
  CreateDialingPlanInput,
  UpdateRoutingRulesInput,
} from 'src/engine/core-modules/telephony/inputs';
import { InsereEmpresa } from 'src/engine/core-modules/telephony/types/Create/InsereEmpresa.type';
import { InsereTronco } from 'src/engine/core-modules/telephony/types/Create/InsereTronco.type';
import { ExtetionBody } from 'src/engine/core-modules/telephony/types/Extention.type';
import {
  ListCommonArgs,
  ListExtentionsArgs,
} from 'src/engine/core-modules/telephony/types/pabx.type';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class PabxService implements PabxServiceInterface {
  private pabxAxiosInstance: AxiosInstance;
  private readonly logger = new Logger(PabxService.name);

  constructor(private readonly environmentService: TwentyConfigService) {
    const PABX_ENV = this.environmentService.get('PABX_ENV');
    const PABX_URL =
      PABX_ENV === NodeEnvironment.production
        ? this.environmentService.get('PABX_URL')
        : this.environmentService.get('PABX_TEST_URL');

    const PABX_USER =
      PABX_ENV === NodeEnvironment.production
        ? this.environmentService.get('PABX_USER')
        : this.environmentService.get('PABX_TEST_USER');

    const PABX_TOKEN =
      PABX_ENV === NodeEnvironment.production
        ? this.environmentService.get('PABX_TOKEN')
        : this.environmentService.get('PABX_TEST_TOKEN');

    this.pabxAxiosInstance = axios.create({
      baseURL: PABX_URL,
      headers: {
        usuario: PABX_USER,
        token: PABX_TOKEN,
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  createExtention: (data: ExtetionBody) => Promise<AxiosResponse> = async (
    data,
  ) => {
    const createRamalResponse = await this.pabxAxiosInstance.post(
      '/inserir_ramal',
      data,
    );

    return createRamalResponse;
  };

  updateExtention: (data: ExtetionBody) => Promise<AxiosResponse> = async (
    data,
  ) => {
    const updateRamalResponse = await this.pabxAxiosInstance.post(
      '/alterar_ramal',
      data,
    );

    return updateRamalResponse;
  };

  listExtentions: (args?: ListExtentionsArgs) => Promise<AxiosResponse> =
    async (args) => {
      const listExtentionsResponse = await this.pabxAxiosInstance.get(
        '/listar_ramais',
        {
          data: { ...(args ?? undefined) },
        },
      );

      return listExtentionsResponse;
    };

  listDialingPlans: (args: ListCommonArgs) => Promise<AxiosResponse> = async (
    args,
  ) => {
    const dialingPlansResponse = await this.pabxAxiosInstance.get(
      '/listar_planos_discagem',
      {
        data: args,
      },
    );

    return dialingPlansResponse;
  };

  listDids: (args: ListCommonArgs) => Promise<AxiosResponse> = async (args) => {
    const listDidsResponse = await this.pabxAxiosInstance.get('/listar_dids', {
      data: args,
    });

    return listDidsResponse;
  };

  listCampaigns: (args: ListCommonArgs) => Promise<AxiosResponse> = async (
    args,
  ) => {
    const listCampaignsResponse = await this.pabxAxiosInstance.get(
      '/listar_campanhas',
      {
        data: args,
      },
    );

    return listCampaignsResponse;
  };

  listIntegrationFlows: (args: ListCommonArgs) => Promise<AxiosResponse> =
    async (args) => {
      const integrationFlowsResponse = await this.pabxAxiosInstance.get(
        '/listar_fluxos_integracao',
        {
          data: args,
        },
      );

      return integrationFlowsResponse;
    };

  createCompany: (data: InsereEmpresa) => Promise<AxiosResponse> = async (
    data,
  ) => {
    try {
      this.logger.log(`Creating company with name: ${data.nome}`);

      const createCompanyResponse = await this.pabxAxiosInstance.post(
        '/inserir_cliente',
        { dados: data },
      );

      this.logger.log(`Company created successfully: ${data.nome}`);

      return createCompanyResponse;
    } catch (error) {
      console.log('error: ', error);

      this.logger.error(
        `Failed to create company: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  createTrunk: (data: InsereTronco) => Promise<AxiosResponse> = async (
    data,
  ) => {
    try {
      this.logger.log(`Creating trunk with name: ${data.nome}`);

      const createTrunkResponse = await this.pabxAxiosInstance.post(
        '/inserir_tronco',
        { dados: data },
      );

      this.logger.log(`Trunk created successfully: ${data.nome}`);

      return createTrunkResponse;
    } catch (error) {
      console.log('error: ', error);

      this.logger.error(
        `Failed to create trunk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };

  createDialingPlan: (data: CreateDialingPlanInput) => Promise<AxiosResponse> =
    async (data) => {
      try {
        this.logger.log(`Creating dialing plan with name: ${data.nome}`);

        const payload = {
          dados: {
            plano_discagem_id: data.plano_discagem_id,
            nome: data.nome,
            cliente_id: data.cliente_id,
          },
        };

        const createDialingPlanResponse = await this.pabxAxiosInstance.post(
          '/inserir_plano_discagem',
          payload,
        );

        this.logger.log(`Dialing plan created successfully: ${data.nome}`);

        return createDialingPlanResponse;
      } catch (error) {
        console.log('error: ', error);

        this.logger.error(
          `Failed to create dialing plan: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    };

  updateRoutingRules: (
    data: UpdateRoutingRulesInput,
  ) => Promise<AxiosResponse> = async (data) => {
    try {
      this.logger.log(
        `Updating routing rules for dialing plan ID: ${data.plano_discagem_id}`,
      );

      const payload = {
        plano_discagem_id: data.plano_discagem_id,
        cliente_id: data.cliente_id,
        dados: data.dados,
      };

      const updateRoutingRulesResponse = await this.pabxAxiosInstance.post(
        '/alterar_regras_roteamento',
        payload,
      );

      this.logger.log(
        `Routing rules updated successfully for dialing plan ID: ${data.plano_discagem_id}`,
      );

      return updateRoutingRulesResponse;
    } catch (error) {
      console.log('error: ', error);

      this.logger.error(
        `Failed to update routing rules: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };
}
