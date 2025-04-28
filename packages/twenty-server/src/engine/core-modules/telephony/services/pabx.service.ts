import { Injectable, Logger } from '@nestjs/common';

import https from 'https';

import axios, { AxiosInstance, AxiosResponse } from 'axios';

import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';
import { PabxServiceInterface } from 'src/engine/core-modules/telephony/interfaces/pabx.interface';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { InsereEmpresa } from 'src/engine/core-modules/telephony/types/Create/InsereEmpresa.type';
import { InsereTronco } from 'src/engine/core-modules/telephony/types/Create/InsereTronco.type';
import { ExtetionBody } from 'src/engine/core-modules/telephony/types/Extention.type';
import { ListExtentionsArgs } from 'src/engine/core-modules/telephony/types/pabx.type';

@Injectable()
export class PabxService implements PabxServiceInterface {
  private pabxAxiosInstance: AxiosInstance;
  private readonly logger = new Logger(PabxService.name);

  public readonly LIST_BODY = {
    pos_registro_inicial: 0,
    cliente_id: 3,
  };

  constructor(private readonly environmentService: EnvironmentService) {
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
          data: { ...this.LIST_BODY, ...(args ?? undefined) },
        },
      );

      return listExtentionsResponse;
    };

  listDialingPlans: () => Promise<AxiosResponse> = async () => {
    const dialingPlansResponse = await this.pabxAxiosInstance.get(
      '/listar_planos_discagem',
      {
        data: this.LIST_BODY,
      },
    );

    return dialingPlansResponse;
  };

  listDids: () => Promise<AxiosResponse> = async () => {
    const listDidsResponse = await this.pabxAxiosInstance.get('/listar_dids', {
      data: this.LIST_BODY,
    });

    return listDidsResponse;
  };

  listCampaigns: () => Promise<AxiosResponse> = async () => {
    const listCampaignsResponse = await this.pabxAxiosInstance.get(
      '/listar_campanhas',
      {
        data: this.LIST_BODY,
      },
    );

    return listCampaignsResponse;
  };

  listIntegrationFlows: () => Promise<AxiosResponse> = async () => {
    const integrationFlowsResponse = await this.pabxAxiosInstance.get(
      '/listar_fluxos_integracao',
      {
        data: this.LIST_BODY,
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

      console.log('createCompanyResponse: ', createCompanyResponse.data);

      this.logger.log(`Company created successfully: ${data.nome}`);

      return createCompanyResponse;
    } catch (error) {
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
      this.logger.error(
        `Failed to create trunk: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  };
}
