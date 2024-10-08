export const parseSAMLMetadata = (xmlString: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }

  const entityDescriptor = xmlDoc.getElementsByTagName(
    'md:EntityDescriptor',
  )[0];
  const idpSSODescriptor = xmlDoc.getElementsByTagName(
    'md:IDPSSODescriptor',
  )[0];
  const keyDescriptor = xmlDoc.getElementsByTagName('md:KeyDescriptor')[0];
  const keyInfo = keyDescriptor.getElementsByTagName('ds:KeyInfo')[0];
  const x509Data = keyInfo.getElementsByTagName('ds:X509Data')[0];
  const x509Certificate = x509Data
    .getElementsByTagName('ds:X509Certificate')?.[0]
    .textContent?.trim();

  const singleSignOnServices = Array.from(
    idpSSODescriptor.getElementsByTagName('md:SingleSignOnService'),
  ).map((service) => ({
    Binding: service.getAttribute('Binding'),
    Location: service.getAttribute('Location'),
  }));

  return {
    ssoUrl: singleSignOnServices.find((singleSignOnService) => {
      return (
        singleSignOnService.Binding ===
        'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
      );
    })?.Location,
    certificate: x509Certificate,
    fingerprint: '',
    entityID: entityDescriptor.getAttribute('entityID'),
  };
};
