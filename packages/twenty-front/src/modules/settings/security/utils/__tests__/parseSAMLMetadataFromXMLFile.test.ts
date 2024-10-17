/* @license Enterprise */

import { parseSAMLMetadataFromXMLFile } from '../parseSAMLMetadataFromXMLFile';

describe('parseSAMLMetadataFromXMLFile', () => {
  it('should parse SAML metadata from XML file', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://test.com" validUntil="2026-02-04T17:46:23.000Z">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>test</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com"/>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://test.com"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: true,
      data: {
        entityID: 'https://test.com',
        ssoUrl: 'https://test.com',
        certificate: 'test',
      },
    });
  });
  it('should return error if XML is invalid', () => {
    const xmlString = 'invalid xml';
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: false,
      error: new Error('Error parsing XML'),
    });
  });
});
