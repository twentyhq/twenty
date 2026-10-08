import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectPermissionsWithObjectMetadataId;
  visibleRecordFields: RecordField[];
};

export const [RecordCalendarContextProvider, useRecordCalendarContextOrThrow] =
  createRequiredContext<RecordCalendarContextValue>('RecordCalendarContext');
