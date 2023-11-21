import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

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
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedStateV2 } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedStateV2';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { mapViewFieldsToBoardFieldDefinitions } from '@/views/utils/mapViewFieldsToBoardFieldDefinitions';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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

  const { currentViewFieldsState } = useViewScopedStates();

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const currentViewFields = useRecoilValue(currentViewFieldsState);

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

  const whereFilters = useMemo(() => {
    return {
      and: [
        {
          pipelineStepId: {
            in: pipelineSteps.map((pipelineStep) => pipelineStep.id),
          },
        },
        ...[],
      ],
    };
  }, [pipelineSteps]) as any;

  useFindManyObjectRecords({
    skip: !pipelineSteps.length,
    objectNamePlural: 'opportunities',
    filter: whereFilters,
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
        in: opportunities.map((opportuntiy) => opportuntiy.companyId || ''),
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

  const setAvailableBoardCardFields = useRecoilCallback(
    ({ snapshot, set }) =>
      (availableBoardCardFields: any) => {
        const availableBoardCardFieldsFromState = snapshot
          .getLoadable(
            availableBoardCardFieldsScopedState({
              scopeId: 'company-board-view',
            }),
          )
          .getValue();

        if (
          !isDeeplyEqual(
            availableBoardCardFieldsFromState,
            availableBoardCardFields,
          )
        ) {
          set(
            availableBoardCardFieldsScopedState({
              scopeId: 'company-board-view',
            }),
            availableBoardCardFields,
          );
        }
      },
    [],
  );

  useRecoilScopedStateV2(
    availableBoardCardFieldsScopedState,
    'company-board-view',
  );

  useEffect(() => {
    const availableTableColumns = columnDefinitions.filter(
      filterAvailableTableColumns,
    );

    setAvailableBoardCardFields(availableTableColumns);
  }, [columnDefinitions, setAvailableBoardCardFields]);

  useEffect(() => {
    setViewObjectMetadataId?.('company');
    setViewType?.(ViewType.Kanban);
  }, [setViewObjectMetadataId, setViewType]);

  const [searchParams] = useSearchParams();

  const loading = !companies;

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  useEffect(() => {
    if (!loading && opportunities && companies) {
      setActionBarEntries();
      setContextMenuEntries();

      updateCompanyBoard(pipelineSteps, opportunities, companies);
      setEntityCountInCurrentView(companies.length);
    }
  }, [
    companies,
    loading,
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
        mapViewFieldsToBoardFieldDefinitions(currentViewFields, []),
      );
    }
  }, [currentViewFields, setBoardCardFields]);

  return <></>;
};
