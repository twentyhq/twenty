import { type EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';

type NodemailerTlsOptions = {
  secure: boolean;
  requireTLS?: boolean;
  ignoreTLS?: boolean;
};

export const mapConnectionSecurityToTransport = (
  connectionSecurity: EmailConnectionSecurity,
): NodemailerTlsOptions => {
  switch (connectionSecurity) {
    case 'SSL_TLS':
      return { secure: true };
    case 'STARTTLS':
      return { secure: false, requireTLS: true };
    case 'NONE':
      return { secure: false, ignoreTLS: true };
  }
};
