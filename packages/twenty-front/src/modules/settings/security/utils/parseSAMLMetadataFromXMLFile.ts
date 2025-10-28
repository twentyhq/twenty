/* @license Enterprise */

import { z } from 'zod';

const validator = z.object({
  entityID: z.url(),
  ssoUrl: z.url(),
  certificate: z.string().min(1),
});

const allPrefix = ['md', 'ns0', 'ns2', 'dsig', 'ds'];

const getByPrefixAndKey = (
  xmlDoc: Document | Element,
  key: string,
  prefixList = [...allPrefix],
): Element | undefined => {
  if (prefixList.length === 0) return undefined;
  return (
    xmlDoc.getElementsByTagName(`${prefixList[0]}:${key}`)?.[0] ??
    getByPrefixAndKey(xmlDoc, key, prefixList.slice(1)) ??
    xmlDoc.getElementsByTagName(key)?.[0]
  );
};

const getAllByPrefixAndKey = (
  xmlDoc: Document | Element,
  key: string,
  prefixList = [...allPrefix],
): Array<Element> => {
  const withPrefix = xmlDoc.getElementsByTagName(`${prefixList[0]}:${key}`);

  if (withPrefix.length !== 0) {
    return Array.from(withPrefix);
  }

  if (prefixList.length > 0) {
    return getAllByPrefixAndKey(xmlDoc, key, prefixList.slice(1));
  }

  return Array.from(xmlDoc.getElementsByTagName(`${key}`));
};

export const parseSAMLMetadataFromXMLFile = (
  xmlString: string,
):
  | { success: true; data: z.infer<typeof validator> }
  | { success: false; error: unknown } => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Error parsing XML');
    }

    const entityDescriptor = getByPrefixAndKey(xmlDoc, 'EntityDescriptor');
    if (!entityDescriptor) throw new Error('No EntityDescriptor found');

    const IDPSSODescriptor = getByPrefixAndKey(xmlDoc, 'IDPSSODescriptor');
    if (!IDPSSODescriptor) throw new Error('No IDPSSODescriptor found');

    const keyDescriptors = getByPrefixAndKey(IDPSSODescriptor, 'KeyDescriptor');
    if (!keyDescriptors) throw new Error('No KeyDescriptor found');

    const keyInfo = getByPrefixAndKey(keyDescriptors, 'KeyInfo');
    if (!keyInfo) throw new Error('No KeyInfo found');

    const x509Data = getByPrefixAndKey(keyInfo, 'X509Data');
    if (!x509Data) throw new Error('No X509Data found');

    const x509Certificate = getByPrefixAndKey(
      x509Data,
      'X509Certificate',
    )?.textContent?.trim();
    if (!x509Certificate) throw new Error('No X509Certificate found');

    const singleSignOnServices = getAllByPrefixAndKey(
      IDPSSODescriptor,
      'SingleSignOnService',
    );

    const result = {
      ssoUrl: singleSignOnServices
        .map((service) => ({
          Binding: service.getAttribute('Binding'),
          Location: service.getAttribute('Location'),
        }))
        .find(
          (singleSignOnService) =>
            singleSignOnService.Binding ===
            'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        )?.Location,
      certificate: x509Certificate,
      entityID: entityDescriptor?.getAttribute('entityID'),
    };

    return { success: true, data: validator.parse(result) };
  } catch (error) {
    return { success: false, error };
  }
};
