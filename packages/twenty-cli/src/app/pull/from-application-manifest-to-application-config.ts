import {
  type ApplicationManifest,
  type Manifest,
} from 'twenty-shared/application';

const APPLICATION_PROPERTIES_TO_STRIP = [
  'packageJsonChecksum',
  'yarnLockChecksum',
  'requiredServerVersionRange',
  'aboutDescription',
  'postInstallLogicFunction',
  'preInstallLogicFunction',
  'uninstallLogicFunction',
  'healthCheckLogicFunction',
  'settingsFrontComponent',
  'settingsCustomTabFrontComponentUniversalIdentifier',
  'frontComponentSharedDependencies',
  'logoUrl',
  'screenshots',
] as const;

const APPLICATION_PROPERTY_NAMES_TO_STRIP = new Set<string>(
  APPLICATION_PROPERTIES_TO_STRIP,
);

const GENERATED_COVER_GALLERY_IMAGE = 'public/cover.generated.png';

const isDefaultRoleExported = (manifest: Manifest): boolean =>
  (manifest.roles ?? []).some(
    ({ universalIdentifier }) =>
      universalIdentifier ===
      manifest.application.defaultRoleUniversalIdentifier,
  );

export const fromApplicationManifestToApplicationConfig = (
  manifest: Manifest,
): Partial<ApplicationManifest> => {
  const applicationConfig = Object.fromEntries(
    Object.entries(manifest.application).filter(
      ([property]) =>
        !APPLICATION_PROPERTY_NAMES_TO_STRIP.has(property) &&
        !(
          property === 'defaultRoleUniversalIdentifier' &&
          isDefaultRoleExported(manifest)
        ),
    ),
  ) as Partial<ApplicationManifest>;

  const { galleryImages } = applicationConfig;

  if (
    !Array.isArray(galleryImages) ||
    galleryImages.length === 0 ||
    galleryImages.every((image) => image === GENERATED_COVER_GALLERY_IMAGE)
  ) {
    const { galleryImages: _galleryImages, ...withoutGalleryImages } =
      applicationConfig;

    return withoutGalleryImages;
  }

  return applicationConfig;
};
