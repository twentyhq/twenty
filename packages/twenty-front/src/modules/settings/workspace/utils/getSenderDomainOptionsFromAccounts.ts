import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  canConnectedAccountPerformEmailOperation,
  getEmailDomain,
  getSendableEmailHandles,
  isDefined,
} from 'twenty-shared/utils';
import { EmailOperation } from 'twenty-shared/types';

export const getSenderDomainOptionsFromAccounts = (
  accounts: Pick<
    ConnectedAccount,
    | 'handle'
    | 'handleAliases'
    | 'provider'
    | 'connectionParameters'
    | 'archivedAt'
  >[],
): string[] => {
  const domains = accounts
    .filter(
      (account) =>
        !isDefined(account.archivedAt) &&
        canConnectedAccountPerformEmailOperation({
          connectedAccount: account,
          operation: EmailOperation.SEND,
        }),
    )
    .flatMap((account) => getSendableEmailHandles(account))
    .map(getEmailDomain)
    .filter(isDefined);

  return [...new Set(domains)].sort();
};
