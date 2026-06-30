/* @license Enterprise */

import { parseSAMLMetadataFromXMLFile } from '@/settings/security/utils/parseSAMLMetadataFromXMLFile';

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
  it('should parse SAML metadata from XML file with prefix', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><ns0:EntityDescriptor xmlns:ns0="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://test.com" validUntil="2026-02-04T17:46:23.000Z">
    <ns0:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <ns0:KeyDescriptor use="signing">
            <ns2:KeyInfo xmlns:ns2="http://www.w3.org/2000/09/xmldsig#">
                <ns2:X509Data>
                    <ns2:X509Certificate>test</ns2:X509Certificate>
                </ns2:X509Data>
            </ns2:KeyInfo>
        </ns0:KeyDescriptor>
        <ns0:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</ns0:NameIDFormat>
        <ns0:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com"/>
        <ns0:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://test.com"/>
    </ns0:IDPSSODescriptor>
</ns0:EntityDescriptor>`;
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
  it('should fall back to HTTP-POST binding when HTTP-Redirect is not advertised', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://test.com">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>test</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sso.jumpcloud.com/saml2/twenty"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: true,
      data: {
        entityID: 'https://test.com',
        ssoUrl: 'https://sso.jumpcloud.com/saml2/twenty',
        certificate: 'test',
      },
    });
  });
  it('should prefer HTTP-Redirect over HTTP-POST when both are advertised', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://test.com">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>test</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://test.com/post"/>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com/redirect"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: true,
      data: {
        entityID: 'https://test.com',
        ssoUrl: 'https://test.com/redirect',
        certificate: 'test',
      },
    });
  });
  it('should return a descriptive reason when no supported binding is found', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://test.com">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>test</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:SOAP" Location="https://test.com/soap"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: false,
      reason:
        'No SingleSignOnService with HTTP-Redirect or HTTP-POST binding was found',
    });
  });
  it('should return a descriptive reason when entityID is not a valid URL', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="IdP Entity ID">
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>test</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sso.jumpcloud.com/saml2/twenty"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: false,
      reason: 'entityID: entityID is not a valid URL',
    });
  });
  it('should return a descriptive reason when EntityDescriptor is missing', () => {
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?><root />`;
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: false,
      reason: 'EntityDescriptor element is missing',
    });
  });
  it('should return error if XML is invalid', () => {
    const xmlString = 'invalid xml';
    const result = parseSAMLMetadataFromXMLFile(xmlString);
    expect(result).toEqual({
      success: false,
      reason: 'File is not valid XML',
    });
  });
});
