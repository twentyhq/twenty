import { type AllMetadataName } from 'twenty-shared/metadata';

export const APPLICATION_MANIFEST_METADATA_NAMES = [
  'objectMetadata',
  'fieldMetadata',
  'logicFunction',
  'frontComponent',
  'role',
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'navigationMenuItem',
  'pageLayout',
  'pageLayoutTab',
  'pageLayoutWidget',
  'commandMenuItem',
] as const satisfies AllMetadataName[];

export type ApplicationManifestMetadataName =
  (typeof APPLICATION_MANIFEST_METADATA_NAMES)[number];
