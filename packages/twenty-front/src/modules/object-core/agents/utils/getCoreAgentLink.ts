import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getCoreAgentLink = (
  agentId: string,
  queryParams?: { turn: string },
) =>
  getAppPath(
    AppPath.RecordShowPage,
    {
      objectNameSingular: CoreObjectNameSingular.Agent,
      objectRecordId: agentId,
    },
    queryParams,
  );
