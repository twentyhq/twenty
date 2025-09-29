import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
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
  viewBarInstanceId: string;
  recordFieldByFieldMetadataItemId: Record<string, RecordField>;
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
  fieldMetadataItemByFieldMetadataItemId: Record<string, FieldMetadataItem>;
  fieldDefinitionByFieldMetadataItemId: Record<
    string,
    ColumnDefinition<FieldMetadata>
  >;
};

export const [RecordIndexContextProvider, useRecordIndexContextOrThrow] =
  createRequiredContext<RecordIndexContextValue>('RecordIndexContext');
