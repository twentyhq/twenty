import { ObjectPermission } from '~/generated-metadata/graphql';

export type ObjectPermissions = Omit<
  ObjectPermission,
  'objectMetadataId' | '__typename'
>;
