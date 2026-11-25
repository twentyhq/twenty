import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { createRequiredContext } from '~/utils/createRequiredContext';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type RecordTableContextValue = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissions: ObjectRecordsPermissions;
  isObjectReadOnly: boolean;
  visibleRecordFields: RecordField[];
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  triggerEvent: 'CLICK' | 'MOUSE_DOWN';
};

export const [RecordTableContextProvider, useRecordTableContextOrThrow] =
  createRequiredContext<RecordTableContextValue>('RecordTableContext');
