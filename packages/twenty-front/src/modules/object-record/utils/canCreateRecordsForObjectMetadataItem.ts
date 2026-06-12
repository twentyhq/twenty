import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated-metadata/graphql';

type CanCreateRecordsForObjectMetadataItemParams = {
  objectPermissions?: ObjectPermission;
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    | 'isUICreatable'
    | 'isUIEditable'
    | 'isSystem'
    | 'isRemote'
    | 'applicationId'
  >;
};

// Single predicate for every generic "create a record" UI affordance.
// Creation requires effective editability because today's inline creation UX
// creates a blank record that the user must then be able to edit.
// There is no CREATE permission yet, so canUpdateObjectRecords (checked
// through isObjectMetadataReadOnly) acts as a proxy.
export const canCreateRecordsForObjectMetadataItem = ({
  objectPermissions,
  objectMetadataItem,
}: CanCreateRecordsForObjectMetadataItemParams): boolean => {
  return (
    objectMetadataItem.isUICreatable &&
    !objectMetadataItem.isSystem &&
    !isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
