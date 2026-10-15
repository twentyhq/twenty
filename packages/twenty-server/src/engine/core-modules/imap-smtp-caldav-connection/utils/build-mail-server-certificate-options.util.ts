import { isIP } from 'net';

type MailServerCertificateOptions = {
  rejectUnauthorized: boolean;
  servername?: string;
};

export const buildMailServerCertificateOptions = ({
  host,
  allowSelfSigned,
}: {
  host: string;
  allowSelfSigned: boolean;
}): MailServerCertificateOptions => ({
  rejectUnauthorized: !allowSelfSigned,
  // The socket targets the IP pinned by the SSRF guard, so the certificate
  // has to be checked against the hostname the account was configured with
  ...(isIP(host) === 0 ? { servername: host } : {}),
});
