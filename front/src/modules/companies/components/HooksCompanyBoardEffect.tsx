import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Company } from '@/companies/types/Company';
import { useComputeDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useComputeDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { useBoardActionBarEntries } from '@/ui/layout/board/hooks/useBoardActionBarEntries';
import { useBoardContext } from '@/ui/layout/board/hooks/useBoardContext';
import { useBoardContextMenuEntries } from '@/ui/layout/board/hooks/useBoardContextMenuEntries';
import { availableBoardCardFieldsScopedState } from '@/ui/layout/board/states/availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '@/ui/layout/board/states/boardCardFieldsScopedState';
import { isBoardLoadedState } from '@/ui/layout/board/states/isBoardLoadedState';
import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useSetRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useSetRecoilScopedStateV2';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToBoardFieldDefinitions } from '@/views/utils/mapViewFieldsToBoardFieldDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

import { useUpdateCompanyBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { useUpdateCompanyBoard } from '../hooks/useUpdateCompanyBoardColumns';

export const HooksCompanyBoardEffect = () => {
  const {
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setEntityCountInCurrentView,
    setViewObjectMetadataId,
    setViewType,
  } = useView();

  const {
    currentViewFieldsState,
    currentViewFiltersState,
    currentViewSortsState,
  } = useViewScopedStates();

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const currentViewFields = useRecoilValue(currentViewFieldsState);
  const currentViewFilters = useRecoilValue(currentViewFiltersState);
  const currentViewSorts = useRecoilValue(currentViewSortsState);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNamePlural: 'opportunities',
  });

  const { columnDefinitions, filterDefinitions, sortDefinitions } =
    useComputeDefinitionsFromFieldMetadata(objectMetadataItem);

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  const { BoardRecoilScopeContext } = useBoardContext();

  const [, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );

  const updateCompanyBoardCardIds = useUpdateCompanyBoardCardIds();
  const updateCompanyBoard = useUpdateCompanyBoard();

  const setAvailableBoardCardFields = useSetRecoilScopedStateV2(
    availableBoardCardFieldsScopedState,
    'company-board-view',
  );

  useFindManyObjectRecords({
    objectNamePlural: 'pipelineSteps',
    filter: {},
    onCompleted: useCallback(
      (data: PaginatedObjectTypeResults<PipelineStep>) => {
        setPipelineSteps(data.edges.map((edge) => edge.node));
      },
      [],
    ),
  });

  const filter = turnFiltersIntoWhereClauseV2(
    mapViewFiltersToFilters(currentViewFilters),
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderByV2(
    mapViewSortsToSorts(currentViewSorts),
    objectMetadataItem?.fields ?? [],
  );

  useFindManyObjectRecords({
    skip: !pipelineSteps.length,
    objectNamePlural: 'opportunities',
    filter: filter,
    orderBy: orderBy,
    onCompleted: useCallback(
      (data: PaginatedObjectTypeResults<Opportunity>) => {
        const pipelineProgresses: Array<Opportunity> = data.edges.map(
          (edge) => edge.node,
        );

        updateCompanyBoardCardIds(pipelineProgresses);

        setOpportunities(pipelineProgresses);
        setIsBoardLoaded(true);
      },
      [setIsBoardLoaded, updateCompanyBoardCardIds],
    ),
  });

  useFindManyObjectRecords({
    skip: !opportunities.length,
    objectNamePlural: 'companies',
    filter: {
      id: {
        in: opportunities.map((opportunity) => opportunity.companyId || ''),
      },
    },
    onCompleted: useCallback((data: PaginatedObjectTypeResults<Company>) => {
      setCompanies(data.edges.map((edge) => edge.node));
    }, []),
  });

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

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  useEffect(() => {
    if (opportunities && companies) {
      setActionBarEntries();
      setContextMenuEntries();

      updateCompanyBoard(pipelineSteps, opportunities, companies);
      setEntityCountInCurrentView(opportunities.length);
    }
  }, [
    companies,
    opportunities,
    pipelineSteps,
    setActionBarEntries,
    setContextMenuEntries,
    setEntityCountInCurrentView,
    updateCompanyBoard,
  ]);

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

  return <></>;
};
