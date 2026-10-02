import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordListContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectPermissionsWithObjectMetadataId;
};

export const [RecordListContextProvider, useRecordListContextOrThrow] =
  createRequiredContext<RecordListContextValue>('RecordListContext');
