import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';

import { FATHOM_PROVIDER_NAME } from 'src/constants/fathom.constant';

export const listFathomConnections = (): Promise<AppConnection[]> =>
  listConnections({ providerName: FATHOM_PROVIDER_NAME });
