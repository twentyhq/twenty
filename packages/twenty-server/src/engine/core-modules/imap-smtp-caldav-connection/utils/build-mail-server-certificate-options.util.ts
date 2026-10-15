import { isIP } from 'net';

import { normalizeAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/normalize-allowed-internal-host.util';

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
}): MailServerCertificateOptions => {
  const hostname = normalizeAllowedInternalHost(host);

  return {
    rejectUnauthorized: !isSelfSignedCertificateAllowed,
    // Socket connects to the SSRF-pinned IP, so verify the cert against the configured hostname
    ...(isIP(hostname) === 0 ? { servername: hostname } : {}),
  };
};
