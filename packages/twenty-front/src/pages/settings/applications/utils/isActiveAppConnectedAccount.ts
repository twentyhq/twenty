import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isActiveAppConnectedAccount = (account: {
  provider: string;
  archivedAt?: string | null;
}): boolean =>
  account.provider === ConnectedAccountProvider.APP &&
  !isDefined(account.archivedAt);
