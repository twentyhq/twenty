import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectPermissionsWithRestrictedFields } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordIndexContextValue = {
  indexIdentifierUrl: (recordId: string) => string;
  onIndexRecordsLoaded: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissionsWithRestrictedFields
  >;
  recordIndexId: string;
};

export const [RecordIndexContextProvider, useRecordIndexContextOrThrow] =
  createRequiredContext<RecordIndexContextValue>('RecordIndexContext');
