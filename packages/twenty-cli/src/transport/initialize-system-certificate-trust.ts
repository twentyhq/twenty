import tls from 'node:tls';

export const initializeSystemCertificateTrust = () => {
  // Node does not include OS-trusted enterprise certificates by default.
  tls.setDefaultCACertificates([
    ...tls.getCACertificates('default'),
    ...tls.getCACertificates('system'),
  ]);
};
