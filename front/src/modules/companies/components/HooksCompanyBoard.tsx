import { useEffect, useMemo } from 'react';
import { useRecoilState } from 'recoil';

import { useBoardActionBarEntries } from '@/ui/board/hooks/useBoardActionBarEntries';
import { useBoardContextMenuEntries } from '@/ui/board/hooks/useBoardContextMenuEntries';
import { isBoardLoadedState } from '@/ui/board/states/isBoardLoadedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { availableFiltersScopedState } from '@/ui/view-bar/states/availableFiltersScopedState';
import { availableSortsScopedState } from '@/ui/view-bar/states/availableSortsScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { sortsOrderByScopedSelector } from '@/ui/view-bar/states/selectors/sortsOrderByScopedSelector';
import { turnFilterIntoWhereClause } from '@/ui/view-bar/utils/turnFilterIntoWhereClause';
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

export function HooksCompanyBoard() {
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    CompanyBoardRecoilScopeContext,
  );

  const [, setAvailableSorts] = useRecoilScopedState(
    availableSortsScopedState,
    CompanyBoardRecoilScopeContext,
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

  const loading =
    loadingGetPipelines || loadingGetPipelineProgress || loadingGetCompanies;

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  useEffect(() => {
    if (!loading && pipeline && pipelineProgresses && companiesData) {
      setActionBarEntries();
      setContextMenuEntries();
      updateCompanyBoard(pipeline, pipelineProgresses, companiesData.companies);
    }
  }, [
    loading,
    pipeline,
    pipelineProgresses,
    companiesData,
    updateCompanyBoard,
    setActionBarEntries,
    setContextMenuEntries,
  ]);

  return <></>;
}
