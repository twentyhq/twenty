import { type ApplicationManifest } from 'twenty-shared/application';

export type ApplicationRegistrationAssetManifest = Pick<
  ApplicationManifest,
  'logo' | 'logoUrl' | 'galleryImages' | 'screenshots'
>;
