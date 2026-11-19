import { isNonEmptyString } from '@sniptt/guards';
import { type AppConnection } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

export const isActiveGranolaPersonalConnection = (
  connection: AppConnection,
): connection is AppConnection & {
  workspaceMemberId: string;
  accessToken: string;
} =>
  isDefined(connection.workspaceMemberId) &&
  !isDefined(connection.authFailedAt) &&
  isNonEmptyString(connection.accessToken);
