import { useEffect } from 'react';

import { useComputeDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useComputeDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordTableContextMenuEntries } from '@/object-record/hooks/useRecordTableContextMenuEntries';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableEffect = ({
  recordTableId,
  viewBarId,
}: {
  recordTableId: string;
  viewBarId: string;
}) => {
  const {
    scopeId: objectNamePlural,
    setAvailableTableColumns,
    setOnEntityCountChange,
    setObjectMetadataConfig,
  } = useRecordTable({ recordTableScopeId: recordTableId });

  const {
    objectMetadataItem,
    basePathToShowPage,
    labelIdentifierFieldMetadataId,
  } = useObjectMetadataItem({
    objectNamePlural,
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useComputeDefinitionsFromFieldMetadata(objectMetadataItem);

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
    setEntityCountInCurrentView,
  } = useViewBar({ viewBarId });

  useEffect(() => {
    if (basePathToShowPage && labelIdentifierFieldMetadataId) {
      setObjectMetadataConfig?.({
        basePathToShowPage,
        labelIdentifierFieldMetadataId,
      });
    }
  }, [
    basePathToShowPage,
    objectMetadataItem,
    labelIdentifierFieldMetadataId,
    setObjectMetadataConfig,
  ]);

  useEffect(() => {
    if (!objectMetadataItem) {
      return;
    }
    setViewObjectMetadataId?.(objectMetadataItem.id);
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
    objectMetadataItem,
    sortDefinitions,
    filterDefinitions,
    setAvailableTableColumns,
  ]);

  const { setActionBarEntries, setContextMenuEntries } =
    useRecordTableContextMenuEntries({
      recordTableScopeId: recordTableId,
    });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setEntityCountInCurrentView(entityCount),
    );
  }, [setEntityCountInCurrentView, setOnEntityCountChange]);

  return <></>;
};
