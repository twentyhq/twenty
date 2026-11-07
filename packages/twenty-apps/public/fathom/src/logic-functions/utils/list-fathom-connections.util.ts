import { type AppConnection, listConnections } from 'twenty-sdk/logic-function';

import { FATHOM_PROVIDER_NAMES } from 'src/constants/fathom.constant';

export const listFathomConnections = async (): Promise<AppConnection[]> =>
  (await listConnections()).filter((connection) =>
    FATHOM_PROVIDER_NAMES.includes(connection.providerName),
  );
