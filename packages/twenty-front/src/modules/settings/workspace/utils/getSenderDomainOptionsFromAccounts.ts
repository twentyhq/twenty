import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  canConnectedAccountSendEmail,
  getEmailDomain,
  getSendableEmailHandles,
  isDefined,
} from 'twenty-shared/utils';

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
    .filter(canConnectedAccountSendEmail)
    .flatMap(getSendableEmailHandles)
    .map(getEmailDomain)
    .filter(isDefined);

  return [...new Set(domains)].sort();
};
