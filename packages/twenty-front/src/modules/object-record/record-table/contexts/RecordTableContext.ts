import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordTableContextValue = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissions: ObjectRecordsPermissionsWithObjectMetadataId;
  isObjectReadOnly: boolean;
  visibleRecordFields: RecordField[];
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  triggerEvent: 'CLICK' | 'MOUSE_DOWN';
};

export const [RecordTableContextProvider, useRecordTableContextOrThrow] =
  createRequiredContext<RecordTableContextValue>('RecordTableContext');
