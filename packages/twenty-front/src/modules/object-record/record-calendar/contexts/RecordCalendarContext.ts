import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectPermission } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordCalendarContextValue = {
  viewBarInstanceId: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectPermissions: ObjectPermission;
  visibleRecordFields: RecordField[];
};

export const [RecordCalendarContextProvider, useRecordCalendarContextOrThrow] =
  createRequiredContext<RecordCalendarContextValue>('RecordCalendarContext');
