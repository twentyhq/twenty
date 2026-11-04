import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordIndexContextValue = {
  indexIdentifierUrl: (recordId: string) => string;
  onIndexRecordsLoaded: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectRecordsPermissionsWithObjectMetadataId
  >;
  recordIndexId: string;
  viewBarInstanceId: string;
  recordFieldByFieldMetadataItemId: Record<string, RecordField>;
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
  fieldMetadataItemByFieldMetadataItemId: Record<string, FieldMetadataItem>;
  fieldDefinitionByFieldMetadataItemId: Record<
    string,
    ColumnDefinition<FieldMetadata>
  >;
  recordLimit?: number;
};

export const [RecordIndexContextProvider, useRecordIndexContextOrThrow] =
  createRequiredContext<RecordIndexContextValue>('RecordIndexContext');
