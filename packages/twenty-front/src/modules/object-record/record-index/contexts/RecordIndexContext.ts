import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectPermissions } from 'twenty-shared/types';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordIndexContextValue = {
  indexIdentifierUrl: (recordId: string) => string;
  onIndexRecordsLoaded: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  recordIndexId: string;
};

export const [RecordIndexContextProvider, useRecordIndexContextOrThrow] =
  createRequiredContext<RecordIndexContextValue>('RecordIndexContext');
