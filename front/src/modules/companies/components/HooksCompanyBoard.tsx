import { useEffect, useMemo } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { pipelineAvailableFieldDefinitions } from '@/pipeline/constants/pipelineAvailableFieldDefinitions';
import { useBoardActionBarEntries } from '@/ui/board/hooks/useBoardActionBarEntries';
import { useBoardContextMenuEntries } from '@/ui/board/hooks/useBoardContextMenuEntries';
import { isBoardLoadedState } from '@/ui/board/states/isBoardLoadedState';
import { viewFieldsDefinitionsState } from '@/ui/board/states/viewFieldsDefinitionsState';
import { availableFiltersScopedState } from '@/ui/filter-n-sort/states/availableFiltersScopedState';
import { filtersScopedState } from '@/ui/filter-n-sort/states/filtersScopedState';
import { turnFilterIntoWhereClause } from '@/ui/filter-n-sort/utils/turnFilterIntoWhereClause';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  Pipeline,
  PipelineProgressableType,
  PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By,
  useGetCompaniesQuery,
  useGetPipelineProgressQuery,
  useGetPipelinesQuery,
} from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

import { useUpdateCompanyBoardCardIds } from '../hooks/useUpdateBoardCardIds';
import { useUpdateCompanyBoard } from '../hooks/useUpdateCompanyBoardColumns';
import { CompanyBoardRecoilScopeContext } from '../states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';

export function HooksCompanyBoard({
  orderBy,
}: {
  orderBy: PipelineProgresses_Order_By[];
  setActionBar?: () => void;
  setContextMenu?: () => void;
}) {
  const setFieldsDefinitionsState = useSetRecoilState(
    viewFieldsDefinitionsState,
  );
  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    CompanyBoardRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableFilters(opportunitiesBoardOptions.filters);
    setFieldsDefinitionsState(pipelineAvailableFieldDefinitions);
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
        orderBy,
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
