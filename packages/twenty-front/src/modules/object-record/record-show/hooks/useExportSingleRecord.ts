import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { csvDownloader } from '@/object-record/record-index/export/utils/csvDownloader';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { isDefined } from 'twenty-shared/utils';

export type UseSingleExportTableDataOptions = {
  filename: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  recordId: string;
};
export const useExportSingleRecord = ({
  filename,
  objectMetadataItem,
  recordId,
}: UseSingleExportTableDataOptions) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const columns: Pick<
    ColumnDefinition<FieldMetadata>,
    'size' | 'label' | 'type' | 'metadata'
  >[] = objectMetadataItem.fields
    .filter((field) => field.isActive)
    .map((field, index) =>
      formatFieldMetadataItemAsColumnDefinition({
        field,
        objectMetadataItem,
        position: index,
      }),
    );
  const { record, error } = useFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
    withSoftDeleted: true,
  });
  const download = () => {
    if (isDefined(error) || !isDefined(record)) {
      return;
    }
    csvDownloader({ filename, rows: [record], columns, objectMetadataItems });
  };
  return { download };
};
