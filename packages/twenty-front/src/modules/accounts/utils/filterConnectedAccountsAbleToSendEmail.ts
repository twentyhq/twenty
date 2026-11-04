import {
  type ConnectedAccountEmailFields,
  EmailOperation,
} from 'twenty-shared/types';
import { canConnectedAccountPerformEmailOperation } from 'twenty-shared/utils';

export const filterConnectedAccountsAbleToSendEmail = <
  TConnectedAccount extends ConnectedAccountEmailFields,
>(
  connectedAccounts: TConnectedAccount[],
): TConnectedAccount[] =>
  connectedAccounts.filter((connectedAccount) =>
    canConnectedAccountPerformEmailOperation({
      connectedAccount,
      operation: EmailOperation.SEND,
    }),
  );
