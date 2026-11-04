import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectRecordsPermissionsWithObjectMetadataId;
  visibleRecordFields: RecordField[];
};

export const [RecordCalendarContextProvider, useRecordCalendarContextOrThrow] =
  createRequiredContext<RecordCalendarContextValue>('RecordCalendarContext');
