/* @license Enterprise */

import { z } from 'zod';

const validator = z.object({
  entityID: z.string().min(1),
  ssoUrl: z.url(),
  certificate: z.string().min(1),
});

const urlSchema = z.url();

const getByKey = (xmlDoc: Document | Element, key: string): Element | undefined => {
  const prefixedElement = Array.from(xmlDoc.getElementsByTagName('*')).find(
    (element) => element.localName === key,
  );

  return prefixedElement ?? xmlDoc.getElementsByTagName(key)?.[0];
};

const getAllByKey = (xmlDoc: Document | Element, key: string): Array<Element> => {
  const prefixedElements = Array.from(xmlDoc.getElementsByTagName('*')).filter(
    (element) => element.localName === key,
  );

  return prefixedElements.length > 0
    ? prefixedElements
    : Array.from(xmlDoc.getElementsByTagName(key));
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

    const entityDescriptor = getByKey(xmlDoc, 'EntityDescriptor');
    if (!entityDescriptor) throw new Error('No EntityDescriptor found');

    const idpSSODescriptor = getByKey(xmlDoc, 'IDPSSODescriptor');
    if (!idpSSODescriptor) throw new Error('No IDPSSODescriptor found');

    const keyDescriptors = getByKey(idpSSODescriptor, 'KeyDescriptor');
    if (!keyDescriptors) throw new Error('No KeyDescriptor found');

    const keyInfo = getByKey(keyDescriptors, 'KeyInfo');
    if (!keyInfo) throw new Error('No KeyInfo found');

    const x509Data = getByKey(keyInfo, 'X509Data');
    if (!x509Data) throw new Error('No X509Data found');

    const x509Certificate = getByKey(x509Data, 'X509Certificate')?.textContent?.trim();
    if (!x509Certificate) throw new Error('No X509Certificate found');

    const singleSignOnServices = getAllByKey(idpSSODescriptor, 'SingleSignOnService');

    const ssoUrl = singleSignOnServices
      .map((service) => service.getAttribute('Location'))
      .find((location) => urlSchema.safeParse(location).success);

    const result = {
      ssoUrl,
      certificate: x509Certificate,
      entityID: entityDescriptor?.getAttribute('entityID'),
    };

    return { success: true, data: validator.parse(result) };
  } catch (error) {
    return { success: false, error };
  }
};
