import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createRequiredContext } from '~/utils/createRequiredContext';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type RecordCalendarContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectRecordsPermissions;
  visibleRecordFields: RecordField[];
};

export const [RecordCalendarContextProvider, useRecordCalendarContextOrThrow] =
  createRequiredContext<RecordCalendarContextValue>('RecordCalendarContext');
