import { areRegistrationAssetsStored } from 'src/engine/core-modules/application/application-registration/utils/are-registration-assets-stored.util';
import type { ApplicationManifest } from 'twenty-shared/application';

const manifestApplication = (
  overrides: Partial<ApplicationManifest>,
): ApplicationManifest =>
  ({
    universalIdentifier: 'universal-identifier',
    displayName: 'App',
    ...overrides,
  }) as ApplicationManifest;

describe('areRegistrationAssetsStored', () => {
  it('should be true when the manifest declares no storable assets', () => {
    expect(
      areRegistrationAssetsStored(
        { logoFileId: null, galleryImages: null },
        manifestApplication({
          logo: 'https://example.com/logo.png',
          galleryImages: ['https://example.com/shot.png'],
        }),
      ),
    ).toBe(true);
  });

  it('should be false when a relative logo has no stored file', () => {
    expect(
      areRegistrationAssetsStored(
        { logoFileId: null, galleryImages: [] },
        manifestApplication({ logo: 'public/logo.png' }),
      ),
    ).toBe(false);
  });

  it('should be false when a relative gallery image has no stored file', () => {
    expect(
      areRegistrationAssetsStored(
        {
          logoFileId: 'logo-file-id',
          galleryImages: [{ path: 'public/shot.png', fileId: null }],
        },
        manifestApplication({
          logo: 'public/logo.png',
          galleryImages: ['public/shot.png'],
        }),
      ),
    ).toBe(false);
  });

  it('should be true when every storable asset has a stored file', () => {
    expect(
      areRegistrationAssetsStored(
        {
          logoFileId: 'logo-file-id',
          galleryImages: [
            { path: 'public/shot.png', fileId: 'shot-file-id' },
            { path: 'https://example.com/external.png', fileId: null },
          ],
        },
        manifestApplication({
          logo: 'public/logo.png',
          galleryImages: [
            'public/shot.png',
            'https://example.com/external.png',
          ],
        }),
      ),
    ).toBe(true);
  });

  it('should be false when the manifest declares a gallery image the registration has never stored', () => {
    expect(
      areRegistrationAssetsStored(
        { logoFileId: 'logo-file-id', galleryImages: [] },
        manifestApplication({
          logo: 'public/logo.png',
          galleryImages: ['public/new-shot.png'],
        }),
      ),
    ).toBe(false);
  });
});
