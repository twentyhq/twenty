import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectPermission } from '~/generated/graphql';
import { createRequiredContext } from '~/utils/createRequiredContext';

type RecordTableContextValue = {
  recordTableId: string;
  viewBarId: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  visibleTableColumns: ColumnDefinition<FieldMetadata>[];
  objectPermissions: ObjectPermission;
};

export const [RecordTableContextProvider, useRecordTableContextOrThrow] =
  createRequiredContext<RecordTableContextValue>('RecordTableContext');
