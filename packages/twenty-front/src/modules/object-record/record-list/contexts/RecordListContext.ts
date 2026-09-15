import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordListContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectPermission;
};

export const [RecordListContextProvider, useRecordListContextOrThrow] =
  createRequiredContext<RecordListContextValue>('RecordListContext');
