import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type EmailOperation } from 'src/engine/core-modules/tool/tools/email-tool/types/email-operation.type';
import { canProviderPerformEmailOperation } from 'src/engine/core-modules/tool/tools/email-tool/utils/can-provider-perform-email-operation.util';

export const canConnectedAccountPerformEmailOperation = ({
  connectedAccount,
  operation,
}: {
  connectedAccount: Pick<
    ConnectedAccountEntity,
    'provider' | 'connectionParameters'
  >;
  operation: EmailOperation;
}): boolean => {
  if (
    !canProviderPerformEmailOperation({
      provider: connectedAccount.provider,
      operation,
    })
  ) {
    return false;
  }

  if (connectedAccount.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
    return true;
  }

  // SMTP carries outbound mail; drafts are appended to the IMAP Drafts folder.
  return operation === 'SEND'
    ? isDefined(connectedAccount.connectionParameters?.SMTP)
    : isDefined(connectedAccount.connectionParameters?.IMAP);
};
