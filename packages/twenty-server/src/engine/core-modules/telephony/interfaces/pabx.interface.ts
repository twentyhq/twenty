import { AxiosResponse } from 'axios';

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
}
