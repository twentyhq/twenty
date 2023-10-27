import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { turnFilterIntoWhereClause } from '@/ui/data/filter/utils/turnFilterIntoWhereClause';
import { useBoardActionBarEntries } from '@/ui/layout/board/hooks/useBoardActionBarEntries';
import { useBoardContextMenuEntries } from '@/ui/layout/board/hooks/useBoardContextMenuEntries';
import { isBoardLoadedState } from '@/ui/layout/board/states/isBoardLoadedState';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';
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
    setAvailableFilters,
    setAvailableSorts,
    setEntityCountInCurrentView,
    setCurrentViewId,
  } = useView();

  const { currentViewFilters, currentViewSortsOrderBy } =
    useViewInternalStates();

  useEffect(() => {
    setAvailableFilters(opportunitiesBoardOptions.filters);
    setAvailableSorts?.(opportunitiesBoardOptions.sorts);
  }, [setAvailableFilters, setAvailableSorts]);

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

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
        orderBy: currentViewSortsOrderBy,
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
      const viewId = searchParams.get('view');
      if (viewId) {
        //setCurrentViewId(viewId);
      }
      setActionBarEntries();
      setContextMenuEntries();
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
    setCurrentViewId,
  ]);

  return <></>;
};
