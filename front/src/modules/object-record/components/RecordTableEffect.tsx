import { useEffect } from 'react';

import { useComputeDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useComputeDefinitionsFromFieldMetadata';
import { useObjectMainIdentifier } from '@/object-metadata/hooks/useObjectMainIdentifier';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordTableContextMenuEntries } from '@/object-record/hooks/useRecordTableContextMenuEntries';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableEffect = () => {
  const {
    scopeId: objectNamePlural,
    setAvailableTableColumns,
    setOnEntityCountChange,
    setObjectMetadataConfig,
  } = useRecordTable();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNamePlural,
  });

  const {
    basePathToShowPage,
    mainIdentifierFieldMetadataId,
    labelIdentifierFieldPaths,
    imageIdentifierUrlField,
    imageIdentifierUrlPrefix,
    imageIdentifierFormat,
  } = useObjectMainIdentifier(objectMetadataItem);

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useComputeDefinitionsFromFieldMetadata(objectMetadataItem);

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
    setEntityCountInCurrentView,
  } = useView();

  useEffect(() => {
    if (basePathToShowPage && mainIdentifierFieldMetadataId) {
      setObjectMetadataConfig?.({
        labelIdentifierFieldPaths,
        imageIdentifierUrlField,
        imageIdentifierUrlPrefix,
        imageIdentifierFormat,
        basePathToShowPage,
        mainIdentifierFieldMetadataId,
      });
    }
  }, [
    basePathToShowPage,
    objectMetadataItem,
    mainIdentifierFieldMetadataId,
    setObjectMetadataConfig,
    labelIdentifierFieldPaths,
    imageIdentifierUrlField,
    imageIdentifierUrlPrefix,
    imageIdentifierFormat,
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
    useRecordTableContextMenuEntries();

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
