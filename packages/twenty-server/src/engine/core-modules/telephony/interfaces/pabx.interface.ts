import { AxiosResponse } from 'axios';

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

export interface PabxServiceInterface {
  createExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  updateExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  listExtentions: (args?: ListExtentionsArgs) => Promise<AxiosResponse>;
  listDialingPlans: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listDids: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listCampaigns: (args: ListCommonArgs) => Promise<AxiosResponse>;
  listIntegrationFlows: (args: ListCommonArgs) => Promise<AxiosResponse>;
  createCompany: (data: InsereEmpresa) => Promise<AxiosResponse>;
  createTrunk: (data: InsereTronco) => Promise<AxiosResponse>;
  createDialingPlan: (data: CreateDialingPlanInput) => Promise<AxiosResponse>;
  updateRoutingRules: (data: UpdateRoutingRulesInput) => Promise<AxiosResponse>;
}
