import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { generatedMockObjectMetadataItemsWithRelated } from '~/testing/utils/generatedMockObjectMetadataItemsWithRelated';

export const generatedMockObjectMetadataItems: ObjectMetadataItem[] =
  enrichObjectMetadataItemsWithPermissions({
    objectMetadataItems: generatedMockObjectMetadataItemsWithRelated,
    objectPermissionsByObjectMetadataId: {},
  });
