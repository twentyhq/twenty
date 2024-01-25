import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { availableRecordBoardDeprecatedCardFieldsScopedState } from '@/object-record/record-board-deprecated/states/availableRecordBoardDeprecatedCardFieldsScopedState';
import { recordBoardCardFieldsScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedCardFieldsScopedState';
import { recordBoardFiltersScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedFiltersScopedState';
import { recordBoardSortsScopedState } from '@/object-record/record-board-deprecated/states/recordBoardDeprecatedSortsScopedState';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useViewBar } from '@/views/hooks/useViewBar';
import { mapViewFieldsToBoardFieldDefinitions } from '@/views/utils/mapViewFieldsToBoardFieldDefinitions';

type HooksCompanyBoardEffectProps = {
  viewBarId: string;
  recordBoardId: string;
};

export const HooksCompanyBoardEffect = ({
  viewBarId,
  recordBoardId,
}: HooksCompanyBoardEffectProps) => {
  const {
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
  } = useViewBar({ viewBarId });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const setAvailableBoardCardFields = useSetRecoilScopedStateV2(
    availableRecordBoardDeprecatedCardFieldsScopedState,
    'company-board',
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
  }, [objectMetadataItem, setViewObjectMetadataId]);

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
    recordBoardCardFieldsScopedState,
    'company-board',
  );
  const setBoardCardFilters = useSetRecoilScopedStateV2(
    recordBoardFiltersScopedState,
    'company-board',
  );

  const setBoardCardSorts = useSetRecoilScopedStateV2(
    recordBoardSortsScopedState,
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

  const { setEntityCountInCurrentView } = useViewBar({ viewBarId });

  const { savedOpportunitiesState } = useRecordBoardDeprecatedScopedStates({
    recordBoardScopeId: recordBoardId,
  });

  const savedOpportunities = useRecoilValue(savedOpportunitiesState);

  useEffect(() => {
    setEntityCountInCurrentView(savedOpportunities.length);
  }, [savedOpportunities.length, setEntityCountInCurrentView]);

  return <></>;
};
