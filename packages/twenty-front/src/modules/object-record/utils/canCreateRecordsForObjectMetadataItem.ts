import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ObjectPermission } from '~/generated-metadata/graphql';

type CanCreateRecordsForObjectMetadataItemParams = {
  objectPermissions?: ObjectPermission & {
    canCreateObjectRecords?: boolean | null;
  };
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'isUICreatable' | 'isUIEditable' | 'isSystem' | 'isRemote' | 'applicationId'
  >;
};

// Single predicate for every generic "create a record" UI affordance.
// Creatability is driven solely by isUICreatable: isSystem only controls
// Data-Model visibility, so a system object can still be user-creatable
// (e.g. marketing message lists kept out of the Data Model).
// Creation requires effective editability because today's inline creation UX
// creates a blank record that the user must then be able to edit.
// When canCreateObjectRecords is explicitly false, creation is disabled.
export const canCreateRecordsForObjectMetadataItem = ({
  objectPermissions,
  objectMetadataItem,
}: CanCreateRecordsForObjectMetadataItemParams): boolean => {
  if (objectPermissions?.canCreateObjectRecords === false) {
    return false;
  }

  return (
    objectMetadataItem.isUICreatable &&
    !isObjectMetadataReadOnly({ objectPermissions, objectMetadataItem })
  );
};
