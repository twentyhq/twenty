/* @license Enterprise */

import { t } from '@lingui/core/macro';
import { z } from 'zod';

const HTTP_REDIRECT_BINDING =
  'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect';
const HTTP_POST_BINDING = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST';

const getValidator = () =>
  z.object({
    entityID: z.url(t`entityID is not a valid URL`),
    ssoUrl: z.url(t`SingleSignOnService Location is not a valid URL`),
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

const formatErrorReason = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => {
        const path = issue.path.join('.');
        return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
      })
      .join('; ');
  }
  if (error instanceof Error) return error.message;
  return t`Unknown parsing error`;
};

export const parseSamlMetadataFromXmlFile = (
  xmlString: string,
):
  | { success: true; data: z.infer<ReturnType<typeof getValidator>> }
  | { success: false; reason: string } => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error(t`File is not valid XML`);
    }

    const entityDescriptor = getByPrefixAndKey(xmlDoc, 'EntityDescriptor');
    if (!entityDescriptor)
      throw new Error(t`EntityDescriptor element is missing`);

    const idpSsoDescriptor = getByPrefixAndKey(xmlDoc, 'IDPSSODescriptor');
    if (!idpSsoDescriptor)
      throw new Error(t`IDPSSODescriptor element is missing`);

    const keyDescriptors = getByPrefixAndKey(idpSsoDescriptor, 'KeyDescriptor');
    if (!keyDescriptors) throw new Error(t`KeyDescriptor element is missing`);

    const keyInfo = getByPrefixAndKey(keyDescriptors, 'KeyInfo');
    if (!keyInfo) throw new Error(t`KeyInfo element is missing`);

    const x509Data = getByPrefixAndKey(keyInfo, 'X509Data');
    if (!x509Data) throw new Error(t`X509Data element is missing`);

    const x509Certificate = getByPrefixAndKey(
      x509Data,
      'X509Certificate',
    )?.textContent?.trim();
    if (!x509Certificate)
      throw new Error(t`X509Certificate is missing or empty`);

    const singleSignOnServices = getAllByPrefixAndKey(
      idpSsoDescriptor,
      'SingleSignOnService',
    ).map((service) => ({
      binding: service.getAttribute('Binding'),
      location: service.getAttribute('Location'),
    }));

    // Prefer HTTP-Redirect (the SP default), falling back to HTTP-POST, the only binding some IdPs (e.g. JumpCloud) advertise
    const ssoUrl =
      singleSignOnServices.find((s) => s.binding === HTTP_REDIRECT_BINDING)
        ?.location ??
      singleSignOnServices.find((s) => s.binding === HTTP_POST_BINDING)
        ?.location;

    if (!ssoUrl) {
      throw new Error(
        t`No SingleSignOnService with HTTP-Redirect or HTTP-POST binding was found`,
      );
    }

    const result = {
      ssoUrl,
      certificate: x509Certificate,
      entityID: entityDescriptor?.getAttribute('entityID'),
    };

    return { success: true, data: getValidator().parse(result) };
  } catch (error) {
    return { success: false, reason: formatErrorReason(error) };
  }
};
