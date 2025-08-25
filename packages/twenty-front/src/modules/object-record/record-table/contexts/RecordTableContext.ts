import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectPermission } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordTableContextValue = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectPermissions: ObjectPermission;
  visibleRecordFields: RecordField[];
  recordFieldByFieldMetadataItemId: Record<string, RecordField>;
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
  fieldMetadataItemByFieldMetadataItemId: Record<string, FieldMetadataItem>;
  fieldDefinitionByFieldMetadataItemId: Record<
    string,
    ColumnDefinition<FieldMetadata>
  >;
};

export const [RecordTableContextProvider, useRecordTableContextOrThrow] =
  createRequiredContext<RecordTableContextValue>('RecordTableContext');
