import { useMemo } from 'react';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useExportProcessRecordsForCSV } from '@/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { csvDownloader } from '@/object-record/record-index/export/hooks/useRecordIndexExportRecords';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export type UseSingleExportTableDataOptions = {
  filename: string;
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
};
export const useExportSingleRecord = ({
  filename,
  objectMetadataItem,
  recordId,
}: UseSingleExportTableDataOptions) => {
  const { processRecordsForCSVExport } = useExportProcessRecordsForCSV(
    objectMetadataItem.nameSingular,
  );

  const downloadCsv = useMemo(
    () =>
      (
        record: ObjectRecord,
        columns: Pick<
          ColumnDefinition<FieldMetadata>,
          'size' | 'label' | 'type' | 'metadata'
        >[],
      ) => {
        const recordToArray = [record];
        const recordsProcessedForExport =
          processRecordsForCSVExport(recordToArray);

        csvDownloader(filename, { rows: recordsProcessedForExport, columns });
      },
    [filename, processRecordsForCSVExport],
  );

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
    downloadCsv(record, columns);
  };
  return { download };
};
