import { useEffect } from 'react';

import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

import { useFindOneObjectMetadataItem } from '../hooks/useFindOneObjectMetadataItem';
import { useTableObjects } from '../hooks/useTableObjects';

export const RecordTableEffect = () => {
  const { scopeId } = useRecordTable();

  const {
    foundObjectMetadataItem,
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
  } = useFindOneObjectMetadataItem({
    objectNamePlural: scopeId,
  });
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectId,
  } = useView();

  useTableObjects();

  useEffect(() => {
    if (!foundObjectMetadataItem) {
      return;
    }
    setViewObjectId?.(foundObjectMetadataItem.id);
    setViewType?.(ViewType.Table);

    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);
  }, [
    setViewObjectId,
    setViewType,
    columnDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    foundObjectMetadataItem,
    sortDefinitions,
    filterDefinitions,
  ]);

  return <></>;
};
