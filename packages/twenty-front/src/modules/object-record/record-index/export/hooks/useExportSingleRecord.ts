import { useMemo } from 'react';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useExportProcessRecordsForCSV } from '@/object-record/object-options-dropdown/hooks/useExportProcessRecordsForCSV';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { csvDownloader } from '@/object-record/record-index/export/hooks/useRecordIndexExport';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export type UseSingleExportTableDataOptions = {
  filename: string;
  objectMetadataItem: ObjectMetadataItem;
  recordId: string;
  recordIndexId: string;
  viewType?: ViewType;
};
export const useExportSingleRecord = ({
  filename,
  objectMetadataItem,
  recordId,
  recordIndexId,
  viewType = ViewType.Table,
}: UseSingleExportTableDataOptions) => {
  const { processRecordsForCSVExport } = useExportProcessRecordsForCSV(
    objectMetadataItem.nameSingular,
  );

  const downloadCsv = useMemo(
    () =>
      (record: ObjectRecord, columns: ColumnDefinition<FieldMetadata>[]) => {
        const recordToArray = [record];
        const recordsProcessedForExport =
          processRecordsForCSVExport(recordToArray);

        csvDownloader(filename, { rows: recordsProcessedForExport, columns });
      },
    [filename, processRecordsForCSVExport],
  );
  const { hiddenBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
    recordIndexId,
  );

  const hiddenKanbanFieldColumn = hiddenBoardFields.find(
    (column) => column.metadata.fieldName === recordGroupFieldMetadata?.name,
  );
  const columns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
    recordIndexId,
  );

  const finalColumns = [
    ...columns,
    ...(hiddenKanbanFieldColumn && viewType === ViewType.Kanban
      ? [hiddenKanbanFieldColumn]
      : []),
  ];
  const { record, error } = useFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
    withSoftDeleted: true,
  });
  const download = () => {
    if (isDefined(error) || !isDefined(record)) {
      return;
    }
    downloadCsv(record, finalColumns);
  };
  return { download };
};
