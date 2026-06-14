import { type EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

type ImapTlsOptions = {
  secure: boolean;
  doSTARTTLS?: boolean;
};

export const buildImapTlsOptions = (
  connectionSecurity: EmailConnectionSecurity,
): ImapTlsOptions => {
  switch (connectionSecurity) {
    case 'SSL_TLS':
      return { secure: true };
    case 'STARTTLS':
      return { secure: false };
    case 'NONE':
      return { secure: false, doSTARTTLS: false };
  }
};
