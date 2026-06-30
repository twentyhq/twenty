import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

type SmtpTlsOptions = {
  secure: boolean;
  ignoreTLS?: boolean;
};

export const buildSmtpTlsOptions = (
  connectionSecurity: EmailConnectionSecurity,
): SmtpTlsOptions => {
  switch (connectionSecurity) {
    case EmailConnectionSecurity.SSL_TLS:
      return { secure: true };
    case EmailConnectionSecurity.STARTTLS:
      return { secure: false };
    case EmailConnectionSecurity.NONE:
      return { secure: false, ignoreTLS: true };
  }
};
