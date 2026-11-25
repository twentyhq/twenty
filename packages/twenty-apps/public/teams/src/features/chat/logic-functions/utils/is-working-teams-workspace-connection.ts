import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

export const isWorkingTeamsWorkspaceConnection = (
  connection: Pick<AppConnection, 'scope' | 'authFailedAt'>,
): boolean =>
  connection.scope === 'WORKSPACE' && !isDefined(connection.authFailedAt);
