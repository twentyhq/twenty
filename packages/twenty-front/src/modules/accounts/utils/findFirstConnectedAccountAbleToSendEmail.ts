import {
  type ConnectedAccountEmailFields,
  EmailOperation,
} from 'twenty-shared/types';
import { canConnectedAccountPerformEmailOperation } from 'twenty-shared/utils';

export const findFirstConnectedAccountAbleToSendEmail = <
  TConnectedAccount extends ConnectedAccountEmailFields,
>(
  connectedAccounts: TConnectedAccount[],
): TConnectedAccount | null =>
  connectedAccounts.find((connectedAccount) =>
    canConnectedAccountPerformEmailOperation({
      connectedAccount,
      operation: EmailOperation.SEND,
    }),
  ) ?? null;
