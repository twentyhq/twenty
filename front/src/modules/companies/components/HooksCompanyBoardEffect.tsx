import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { pipelineAvailableFieldDefinitions } from '@/pipeline/constants/pipelineAvailableFieldDefinitions';
import { useBoardActionBarEntries } from '@/ui/layout/board/hooks/useBoardActionBarEntries';
import { useBoardContext } from '@/ui/layout/board/hooks/useBoardContext';
import { useBoardContextMenuEntries } from '@/ui/layout/board/hooks/useBoardContextMenuEntries';
import { availableBoardCardFieldsScopedState } from '@/ui/layout/board/states/availableBoardCardFieldsScopedState';
import { boardCardFieldsScopedState } from '@/ui/layout/board/states/boardCardFieldsScopedState';
import { isBoardLoadedState } from '@/ui/layout/board/states/isBoardLoadedState';
import { turnFilterIntoWhereClause } from '@/ui/object/filter/utils/turnFilterIntoWhereClause';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { useViewGetStates } from '@/views/hooks/useViewGetStates';
import { ViewType } from '@/views/types/ViewType';
import { viewFieldsToBoardFieldDefinitions } from '@/views/utils/viewFieldsToBoardFieldDefinitions';
import {
  Pipeline,
  PipelineProgressableType,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
  useGetPipelinesQuery,
} from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { useUpdateCompanyBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { useUpdateCompanyBoard } from '../hooks/useUpdateCompanyBoardColumns';

export const HooksCompanyBoardEffect = () => {
  const {
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setEntityCountInCurrentView,
    setViewObjectId,
    setViewType,
  } = useView();

  const { currentViewFilters, currentViewFields } = useViewGetStates();

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  const { BoardRecoilScopeContext } = useBoardContext();

  const [, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );

  const [, setAvailableBoardCardFields] = useRecoilScopedState(
    availableBoardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );

  const updateCompanyBoard = useUpdateCompanyBoard();

  const { data: pipelineData, loading: loadingGetPipelines } =
    useGetPipelinesQuery({
      variables: {
        where: {
          pipelineProgressableType: {
            equals: PipelineProgressableType.Company,
          },
        },
      },
    });

  const pipeline = pipelineData?.findManyPipeline[0] as Pipeline | undefined;

  useEffect(() => {
    setAvailableFilterDefinitions(opportunitiesBoardOptions.filterDefinitions);
    setAvailableSortDefinitions?.(opportunitiesBoardOptions.sortDefinitions);
    setAvailableFieldDefinitions?.(pipelineAvailableFieldDefinitions);
  }, [
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
  ]);

  useEffect(() => {
    setViewObjectId?.('company');
    setViewType?.(ViewType.Kanban);
  }, [setViewObjectId, setViewType]);

  const pipelineStageIds = pipeline?.pipelineStages
    ?.map((pipelineStage) => pipelineStage.id)
    .flat();

  const whereFilters = useMemo(() => {
    return {
      AND: [
        { pipelineStageId: { in: pipelineStageIds } },
        ...(currentViewFilters?.map(turnFilterIntoWhereClause) || []),
      ],
    };
  }, [currentViewFilters, pipelineStageIds]) as any;

  const updateCompanyBoardCardIds = useUpdateCompanyBoardCardIds();

  const { data: pipelineProgressData, loading: loadingGetPipelineProgress } =
    useGetPipelineProgressQuery({
      variables: {
        where: whereFilters,
      },
      onCompleted: (data) => {
        const pipelineProgresses = data?.findManyPipelineProgress || [];

        updateCompanyBoardCardIds(pipelineProgresses);

        setIsBoardLoaded(true);
      },
    });

  const pipelineProgresses = useMemo(() => {
    return pipelineProgressData?.findManyPipelineProgress || [];
  }, [pipelineProgressData]);

  const { data: companiesData, loading: loadingGetCompanies } =
    useGetCompaniesQuery({
      variables: {
        where: {
          id: {
            in: pipelineProgresses.map((item) => item.companyId || ''),
          },
        },
      },
    });

  const [searchParams] = useSearchParams();

  const loading =
    loadingGetPipelines || loadingGetPipelineProgress || loadingGetCompanies;

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  useEffect(() => {
    if (!loading && pipeline && pipelineProgresses && companiesData) {
      setActionBarEntries();
      setContextMenuEntries();
      setAvailableBoardCardFields(pipelineAvailableFieldDefinitions);
      updateCompanyBoard(pipeline, pipelineProgresses, companiesData.companies);
      setEntityCountInCurrentView(companiesData.companies.length);
    }
  }, [
    loading,
    pipeline,
    pipelineProgresses,
    companiesData,
    updateCompanyBoard,
    setActionBarEntries,
    setContextMenuEntries,
    searchParams,
    setEntityCountInCurrentView,
    setAvailableBoardCardFields,
  ]);

  useEffect(() => {
    if (currentViewFields) {
      setBoardCardFields(
        viewFieldsToBoardFieldDefinitions(
          currentViewFields,
          pipelineAvailableFieldDefinitions,
        ),
      );
    }
  }, [currentViewFields, setBoardCardFields]);

  return <></>;
};
