import { AxiosResponse } from 'axios';

import { CreateDialingPlanInput } from 'src/engine/core-modules/telephony/inputs';
import { InsereEmpresa } from 'src/engine/core-modules/telephony/types/Create/InsereEmpresa.type';
import { InsereTronco } from 'src/engine/core-modules/telephony/types/Create/InsereTronco.type';
import { ExtetionBody } from 'src/engine/core-modules/telephony/types/Extention.type';
import { ListExtentionsArgs } from 'src/engine/core-modules/telephony/types/pabx.type';

export interface PabxServiceInterface {
  createExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  updateExtention: (data: ExtetionBody) => Promise<AxiosResponse>;
  listExtentions: (args?: ListExtentionsArgs) => Promise<AxiosResponse>;
  listDialingPlans: () => Promise<AxiosResponse>;
  listDids: () => Promise<AxiosResponse>;
  listCampaigns: () => Promise<AxiosResponse>;
  listIntegrationFlows: () => Promise<AxiosResponse>;
  createCompany: (data: InsereEmpresa) => Promise<AxiosResponse>;
  createTrunk: (data: InsereTronco) => Promise<AxiosResponse>;
  createDialingPlan: (data: CreateDialingPlanInput) => Promise<AxiosResponse>;
}
