import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { availableFiltersScopedState } from '@/ui/Data/View Bar/states/availableFiltersScopedState';
import { availableSortsScopedState } from '@/ui/Data/View Bar/states/availableSortsScopedState';
import { currentViewIdScopedState } from '@/ui/Data/View Bar/states/currentViewIdScopedState';
import { entityCountInCurrentViewState } from '@/ui/Data/View Bar/states/entityCountInCurrentViewState';
import { filtersScopedState } from '@/ui/Data/View Bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/Data/View Bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/Data/View Bar/states/savedSortsFamilyState';
import { sortsOrderByScopedSelector } from '@/ui/Data/View Bar/states/selectors/sortsOrderByScopedSelector';
import { sortsScopedState } from '@/ui/Data/View Bar/states/sortsScopedState';
import { turnFilterIntoWhereClause } from '@/ui/Data/View Bar/utils/turnFilterIntoWhereClause';
import { useBoardActionBarEntries } from '@/ui/Layout/Board/hooks/useBoardActionBarEntries';
import { useBoardContextMenuEntries } from '@/ui/Layout/Board/hooks/useBoardContextMenuEntries';
import { isBoardLoadedState } from '@/ui/Layout/Board/states/isBoardLoadedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
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
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

export const HooksCompanyBoardEffect = () => {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    CompanyBoardRecoilScopeContext,
  );

  const [, setAvailableSorts] = useRecoilScopedState(
    availableSortsScopedState,
    CompanyBoardRecoilScopeContext,
  );

  const [, setEntityCountInCurrentView] = useRecoilState(
    entityCountInCurrentViewState,
  );

  useEffect(() => {
    setAvailableFilters(opportunitiesBoardOptions.filters);
    setAvailableSorts(opportunitiesBoardOptions.sorts);
  });

  const [, setIsBoardLoaded] = useRecoilState(isBoardLoadedState);

  const filters = useRecoilScopedValue(
    filtersScopedState,
    CompanyBoardRecoilScopeContext,
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

  const pipelineStageIds = pipeline?.pipelineStages
    ?.map((pipelineStage) => pipelineStage.id)
    .flat();

  const sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    CompanyBoardRecoilScopeContext,
  );
  const whereFilters = useMemo(() => {
    return {
      AND: [
        { pipelineStageId: { in: pipelineStageIds } },
        ...filters.map(turnFilterIntoWhereClause),
      ],
    };
  }, [filters, pipelineStageIds]) as any;

  const updateCompanyBoardCardIds = useUpdateCompanyBoardCardIds();

  const { data: pipelineProgressData, loading: loadingGetPipelineProgress } =
    useGetPipelineProgressQuery({
      variables: {
        where: whereFilters,
        orderBy: sortsOrderBy,
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
  const boardRecoilScopeId = useRecoilScopeId(CompanyBoardRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentView = await snapshot.getPromise(
          currentViewIdScopedState(boardRecoilScopeId),
        );
        if (currentView === viewId) {
          return;
        }

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState(viewId),
        );

        set(filtersScopedState(boardRecoilScopeId), savedFilters);
        set(sortsScopedState(boardRecoilScopeId), savedSorts);
        set(currentViewIdScopedState(boardRecoilScopeId), viewId);
      },
    [boardRecoilScopeId],
  );

  const loading =
    loadingGetPipelines || loadingGetPipelineProgress || loadingGetCompanies;

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  useEffect(() => {
    if (!loading && pipeline && pipelineProgresses && companiesData) {
      const viewId = searchParams.get('view');
      if (viewId) {
        handleViewSelect(viewId);
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
    handleViewSelect,
    setEntityCountInCurrentView,
  ]);

  return <></>;
};
