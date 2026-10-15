import { isIP } from 'net';

type MailServerCertificateOptions = {
  rejectUnauthorized: boolean;
  servername?: string;
};

export const buildMailServerCertificateOptions = ({
  host,
  isSelfSignedCertificateAllowed,
}: {
  host: string;
  isSelfSignedCertificateAllowed: boolean;
}): MailServerCertificateOptions => ({
  rejectUnauthorized: !isSelfSignedCertificateAllowed,
  // Socket connects to the SSRF-pinned IP, so verify the cert against the configured hostname
  ...(isIP(host) === 0 ? { servername: host } : {}),
});
