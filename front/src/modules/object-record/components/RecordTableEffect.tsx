import { useEffect } from 'react';

import { useComputeDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useComputeDefinitionsFromFieldMetadata';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useObjectMainIdentifier } from '@/object-metadata/hooks/useObjectMainIdentifier';
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

  const { foundObjectMetadataItem } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  const {
    mainIdentifierMapper,
    basePathToShowPage,
    mainIdentifierFieldMetadataId,
  } = useObjectMainIdentifier(foundObjectMetadataItem);

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useComputeDefinitionsFromFieldMetadata(foundObjectMetadataItem);

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
    setEntityCountInCurrentView,
  } = useView();

  useEffect(() => {
    if (
      mainIdentifierMapper &&
      basePathToShowPage &&
      mainIdentifierFieldMetadataId
    ) {
      setObjectMetadataConfig?.({
        mainIdentifierMapper,
        basePathToShowPage,
        mainIdentifierFieldMetadataId,
      });
    }
  }, [
    basePathToShowPage,
    foundObjectMetadataItem,
    mainIdentifierFieldMetadataId,
    mainIdentifierMapper,
    setObjectMetadataConfig,
  ]);

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

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setEntityCountInCurrentView(entityCount),
    );
  }, [setEntityCountInCurrentView, setOnEntityCountChange]);

  return <></>;
};
