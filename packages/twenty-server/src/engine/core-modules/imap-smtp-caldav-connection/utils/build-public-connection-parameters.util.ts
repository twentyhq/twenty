import { ACCOUNT_TYPES } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

type PublicConnectionParams = {
  host: string;
  port: number;
  username?: string;
  secure?: boolean;
};

type PublicConnectionParameters = {
  IMAP?: PublicConnectionParams;
  SMTP?: PublicConnectionParams;
  CALDAV?: PublicConnectionParams;
} | null;

export const buildPublicConnectionParameters = (
  connectionParameters: ImapSmtpCaldavParams | null | undefined,
): PublicConnectionParameters => {
  if (!isDefined(connectionParameters)) {
    return null;
  }

  return ACCOUNT_TYPES.reduce<NonNullable<PublicConnectionParameters>>(
    (result, protocol) => {
      const params = connectionParameters[protocol];

      if (!isDefined(params)) {
        return result;
      }

      const { password: _, ...publicParams } = params;

      result[protocol] = publicParams;

      return result;
    },
    {},
  );
};
