import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissions: ObjectPermission;
  visibleRecordFields: RecordField[];
};

export const [RecordCalendarContextProvider, useRecordCalendarContextOrThrow] =
  createRequiredContext<RecordCalendarContextValue>('RecordCalendarContext');
