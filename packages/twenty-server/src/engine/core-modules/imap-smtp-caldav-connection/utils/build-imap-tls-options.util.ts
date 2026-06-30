import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

type ImapTlsOptions = {
  secure: boolean;
  doSTARTTLS?: boolean;
};

export const buildImapTlsOptions = (
  connectionSecurity: EmailConnectionSecurity,
): ImapTlsOptions => {
  switch (connectionSecurity) {
    case EmailConnectionSecurity.SSL_TLS:
      return { secure: true };
    case EmailConnectionSecurity.STARTTLS:
      return { secure: false };
    case EmailConnectionSecurity.NONE:
      return { secure: false, doSTARTTLS: false };
  }
};
