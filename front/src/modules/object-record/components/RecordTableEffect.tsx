import { useEffect } from 'react';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useRecordTableContextMenuEntries } from '@/object-record/hooks/useRecordTableContextMenuEntries';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableEffect = () => {
  const { scopeId: objectNamePlural, setAvailableTableColumns } =
    useRecordTable();

  const {
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
    foundObjectMetadataItem,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
  } = useView();

  useEffect(() => {
    if (!foundObjectMetadataItem) {
      return;
    }
    setViewObjectMetadataId?.(foundObjectMetadataItem.id);
    setViewType?.(ViewType.Table);

    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);

    const availableTableColumns = columnDefinitions.filter(
      filterAvailableTableColumns,
    );

    setAvailableTableColumns(availableTableColumns);
  }, [
    setViewObjectMetadataId,
    setViewType,
    columnDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    foundObjectMetadataItem,
    sortDefinitions,
    filterDefinitions,
    setAvailableTableColumns,
  ]);

  const { setActionBarEntries, setContextMenuEntries } =
    useRecordTableContextMenuEntries();

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  return <></>;
};
