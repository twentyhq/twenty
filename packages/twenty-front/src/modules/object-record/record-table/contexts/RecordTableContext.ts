import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordTableContextValue = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectPermissions: ObjectPermission;
  visibleRecordFields: RecordField[];
  onRecordIdentifierClick?: (rowIndex: number, recordId: string) => void;
  triggerEvent: 'CLICK' | 'MOUSE_DOWN';
  recordLimit?: number;
};

export const [RecordTableContextProvider, useRecordTableContextOrThrow] =
  createRequiredContext<RecordTableContextValue>('RecordTableContext');
