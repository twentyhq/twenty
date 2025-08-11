import { type ObjectPermission } from '~/generated-metadata/graphql';

export type ObjectPermissions = {
  [K in keyof Omit<
    ObjectPermission,
    'objectMetadataId' | '__typename'
  >]-?: boolean;
};
