import { type ApplicationManifest } from 'twenty-shared/application';

import { buildRegistrationManifestUpdateFields } from 'src/engine/core-modules/application/application-registration/utils/build-registration-manifest-update-fields.util';

describe('buildRegistrationManifestUpdateFields', () => {
  it('should keep stored fileIds for gallery paths that did not change', () => {
    const result = buildRegistrationManifestUpdateFields({
      manifestApplication: {
        universalIdentifier: 'my-app',
        galleryImages: ['images/kept.png', 'images/new.png'],
      } as unknown as ApplicationManifest,
      existingGalleryImages: [
        { path: 'images/kept.png', fileId: 'file-kept' },
        { path: 'images/removed.png', fileId: 'file-removed' },
      ],
    });

    expect(result.galleryImages).toEqual([
      { path: 'images/kept.png', fileId: 'file-kept' },
      { path: 'images/new.png', fileId: null },
    ]);
  });

  it('should handle a missing manifest application and no stored images', () => {
    const result = buildRegistrationManifestUpdateFields({
      manifestApplication: undefined,
      existingGalleryImages: null,
    });

    expect(result.galleryImages).toEqual([]);
    expect(result.logo).toBeNull();
  });
});
