import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { availableTableColumnsScopedState } from '@/ui/object/record-table/states/availableTableColumnsScopedState';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

import { useMetadataObjectInContext } from '../hooks/useMetadataObjectInContext';

export const ObjectTableEffect = () => {
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectId,
  } = useView();

  const {
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
    foundMetadataObject,
  } = useMetadataObjectInContext();

  const tableScopeId = foundMetadataObject?.namePlural ?? '';

  const setAvailableTableColumns = useSetRecoilState(
    availableTableColumnsScopedState(tableScopeId),
  );

  useEffect(() => {
    if (!foundMetadataObject) {
      return;
    }
    setViewObjectId?.(foundMetadataObject.id);
    setViewType?.(ViewType.Table);

    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);

    setAvailableTableColumns(columnDefinitions);
  }, [
    setAvailableTableColumns,
    setViewObjectId,
    setViewType,
    columnDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    foundMetadataObject,
    sortDefinitions,
    filterDefinitions,
  ]);

  return <></>;
};
