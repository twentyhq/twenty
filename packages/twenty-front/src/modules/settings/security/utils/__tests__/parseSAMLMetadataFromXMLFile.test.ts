import { parseSAMLMetadataFromXMLFile } from '../parseSAMLMetadataFromXMLFile';

describe('parseSAMLMetadataFromXMLFile', () => {
  it('should parse SAML metadata from XML file', () => {
    const xmlString = `
      <md:EntityDescriptor entityID="https://test.com">
        <md:IDPSSODescriptor>
          <md:KeyDescriptor>
            <ds:KeyInfo>
              <ds:X509Data>
                <ds:X509Certificate>test</ds:X509Certificate>
              </ds:X509Data>
            </ds:KeyInfo>
          </md:KeyDescriptor>
          <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://test.com" />
        </md:IDPSSODescriptor>
      </md:EntityDescriptor>
    `;
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
