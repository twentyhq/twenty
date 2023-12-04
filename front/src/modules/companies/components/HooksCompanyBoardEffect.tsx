import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { availableBoardCardFieldsScopedState } from '@/ui/object/record-board/states/availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '@/ui/object/record-board/states/boardCardFieldsScopedState';
import { boardFiltersScopedState } from '@/ui/object/record-board/states/boardFiltersScopedState';
import { boardSortsScopedState } from '@/ui/object/record-board/states/boardSortsScopedState';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToBoardFieldDefinitions } from '@/views/utils/mapViewFieldsToBoardFieldDefinitions';

type HooksCompanyBoardEffectProps = {
  viewBarId: string;
};

export const HooksCompanyBoardEffect = ({
  viewBarId,
}: HooksCompanyBoardEffectProps) => {
  const {
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
    setViewType,
  } = useViewBar({ viewBarId: viewBarId });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNamePlural: 'opportunities',
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const setAvailableBoardCardFields = useSetRecoilScopedStateV2(
    availableBoardCardFieldsScopedState,
    'company-board-view',
  );

  useEffect(() => {
    if (!objectMetadataItem) {
      return;
    }
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);
  }, [
    columnDefinitions,
    filterDefinitions,
    objectMetadataItem,
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    sortDefinitions,
  ]);

  useEffect(() => {
    const availableTableColumns = columnDefinitions.filter(
      filterAvailableTableColumns,
    );

    setAvailableBoardCardFields(availableTableColumns);
  }, [columnDefinitions, setAvailableBoardCardFields]);

  useEffect(() => {
    if (!objectMetadataItem) {
      return;
    }
    setViewObjectMetadataId?.(objectMetadataItem.id);
    setViewType?.(ViewType.Kanban);
  }, [objectMetadataItem, setViewObjectMetadataId, setViewType]);

  const {
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewSortsState,
  } = useViewScopedStates({ viewScopeId: viewBarId });

  const currentViewFields = useRecoilValue(currentViewFieldsState);
  const currentViewFilters = useRecoilValue(currentViewFiltersState);
  const currentViewSorts = useRecoilValue(currentViewSortsState);

  //TODO: Modify to use scopeId
  const setBoardCardFields = useSetRecoilScopedStateV2(
    boardCardFieldsScopedState,
    'company-board',
  );
  const setBoardCardFilters = useSetRecoilScopedStateV2(
    boardFiltersScopedState,
    'company-board',
  );

  const setBoardCardSorts = useSetRecoilScopedStateV2(
    boardSortsScopedState,
    'company-board',
  );

  useEffect(() => {
    if (currentViewFields) {
      setBoardCardFields(
        mapViewFieldsToBoardFieldDefinitions(
          currentViewFields,
          columnDefinitions,
        ),
      );
    }
    console.log('currentViewFields', currentViewFields);
  }, [columnDefinitions, currentViewFields, setBoardCardFields]);

  useEffect(() => {
    if (currentViewFilters) {
      setBoardCardFilters(currentViewFilters);
    }
  }, [currentViewFilters, setBoardCardFilters]);

  useEffect(() => {
    if (currentViewSorts) {
      setBoardCardSorts(currentViewSorts);
    }
  }, [currentViewSorts, setBoardCardSorts]);

  return <></>;
};
