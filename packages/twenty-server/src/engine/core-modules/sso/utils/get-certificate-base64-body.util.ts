/* @license Enterprise */

// Certificates come as PEM or as the bare base64 of IdP metadata, both wrapped in whitespace
export const getCertificateBase64Body = (certificate: string) =>
  certificate
    .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
    .replace(/\s/g, '');
