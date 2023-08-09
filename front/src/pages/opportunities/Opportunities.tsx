import { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { useTheme } from '@emotion/react';

import { HooksCompanyBoard } from '@/companies/components/HooksCompanyBoard';
import { CompanyBoardContext } from '@/companies/states/CompanyBoardContext';
import {
  defaultPipelineProgressOrderBy,
  GET_PIPELINES,
  PipelineProgressesSelectedSortType,
} from '@/pipeline/queries';
import { BoardActionBarButtonDeleteBoardCard } from '@/ui/board/components/BoardActionBarButtonDeleteBoardCard';
import { EntityBoard } from '@/ui/board/components/EntityBoard';
import { EntityBoardActionBar } from '@/ui/board/components/EntityBoardActionBar';
import { BoardOptionsContext } from '@/ui/board/states/BoardOptionsContext';
import { reduceSortsToOrderBy } from '@/ui/filter-n-sort/helpers';
import { AvailableFiltersContext } from '@/ui/filter-n-sort/states/AvailableFiltersContext';
import { IconTargetArrow } from '@/ui/icon/index';
import { WithTopBarContainer } from '@/ui/layout/components/WithTopBarContainer';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import {
  PipelineProgressOrderByWithRelationInput,
  useDeleteManyPipelineProgressMutation,
  useUpdatePipelineStageMutation,
} from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

export function Opportunities() {
  const theme = useTheme();

  const [orderBy, setOrderBy] = useState<
    PipelineProgressOrderByWithRelationInput[]
  >(defaultPipelineProgressOrderBy);

  const updateSorts = useCallback(
    (sorts: Array<PipelineProgressesSelectedSortType>) => {
      setOrderBy(
        sorts.length
          ? reduceSortsToOrderBy(sorts)
          : defaultPipelineProgressOrderBy,
      );
    },
    [],
  );

  const [updatePipelineStage] = useUpdatePipelineStageMutation();

  function handleEditColumnTitle(
    boardColumnId: string,
    newTitle: string,
    newColor: string,
  ) {
    updatePipelineStage({
      variables: {
        id: boardColumnId,
        data: { name: newTitle, color: newColor },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        updateOnePipelineStage: {
          __typename: 'PipelineStage',
          id: boardColumnId,
          name: newTitle,
          color: newColor,
        },
      },
    });
  }

  const [deletePipelineProgress] = useDeleteManyPipelineProgressMutation({
    refetchQueries: [getOperationName(GET_PIPELINES) ?? ''],
  });

  async function handleDelete(cardIdsToDelete: string[]) {
    await deletePipelineProgress({
      variables: {
        ids: cardIdsToDelete,
      },
    });
  }

  return (
    <WithTopBarContainer
      title="Opportunities"
      icon={<IconTargetArrow size={theme.icon.size.md} />}
    >
      <BoardOptionsContext.Provider value={opportunitiesBoardOptions}>
        <RecoilScope SpecificContext={CompanyBoardContext}>
          <AvailableFiltersContext.Provider
            value={opportunitiesBoardOptions.filters}
          >
            <HooksCompanyBoard orderBy={orderBy} />
            <EntityBoard
              boardOptions={opportunitiesBoardOptions}
              updateSorts={updateSorts}
              onEditColumnTitle={handleEditColumnTitle}
            />
            <EntityBoardActionBar>
              <BoardActionBarButtonDeleteBoardCard onDelete={handleDelete} />
            </EntityBoardActionBar>
          </AvailableFiltersContext.Provider>
        </RecoilScope>
      </BoardOptionsContext.Provider>
    </WithTopBarContainer>
  );
}
