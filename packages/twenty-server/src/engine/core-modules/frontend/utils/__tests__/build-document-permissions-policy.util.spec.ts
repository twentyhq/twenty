import { buildDocumentPermissionsPolicy } from '../build-document-permissions-policy.util';

describe('buildDocumentPermissionsPolicy', () => {
  it('denies geolocation alongside the delegated media capabilities', () => {
    expect(
      buildDocumentPermissionsPolicy([
        {
          origin: 'https://phone.example.com',
          microphone: true,
          camera: false,
        },
      ]),
    ).toBe(
      'microphone=(self "https://phone.example.com"), camera=(self), geolocation=()',
    );
  });
});
