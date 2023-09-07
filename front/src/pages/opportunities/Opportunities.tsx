import { useCallback, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { HooksCompanyBoard } from '@/companies/components/HooksCompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineStages } from '@/pipeline/hooks/usePipelineStages';
import { EntityBoard } from '@/ui/board/components/EntityBoard';
import { EntityBoardActionBar } from '@/ui/board/components/EntityBoardActionBar';
import { EntityBoardContextMenu } from '@/ui/board/components/EntityBoardContextMenu';
import { BoardOptionsContext } from '@/ui/board/contexts/BoardOptionsContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconTargetArrow } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { reduceSortsToOrderBy } from '@/ui/view-bar/helpers';
import { SelectedSortType } from '@/ui/view-bar/types/interface';
import {
  PipelineProgressOrderByWithRelationInput,
  SortOrder,
  useUpdatePipelineStageMutation,
} from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

const StyledPageHeader = styled(PageHeader)`
  position: relative;
  z-index: 2;
`;

export function Opportunities() {
  const theme = useTheme();

  const [orderBy, setOrderBy] = useState<
    PipelineProgressOrderByWithRelationInput[]
  >([{ createdAt: SortOrder.Asc }]);

  const updateSorts = useCallback(
    (
      sorts: Array<SelectedSortType<PipelineProgressOrderByWithRelationInput>>,
    ) => {
      setOrderBy(
        sorts.length
          ? reduceSortsToOrderBy(sorts)
          : [{ createdAt: SortOrder.Asc }],
      );
    },
    [],
  );

  const { handlePipelineStageAdd, handlePipelineStageDelete } =
    usePipelineStages();

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

  return (
    <PageContainer>
      <RecoilScope>
        <StyledPageHeader
          title="Opportunities"
          Icon={IconTargetArrow}
          iconProps={{ size: theme.icon.size.md }}
        >
          <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
            <PipelineAddButton />
          </RecoilScope>
        </StyledPageHeader>
        <PageBody>
          <BoardOptionsContext.Provider value={opportunitiesBoardOptions}>
            <RecoilScope SpecificContext={CompanyBoardRecoilScopeContext}>
              <HooksCompanyBoard orderBy={orderBy} />
              <EntityBoard
                boardOptions={opportunitiesBoardOptions}
                updateSorts={updateSorts}
                onEditColumnTitle={handleEditColumnTitle}
                onColumnAdd={handlePipelineStageAdd}
                onColumnDelete={handlePipelineStageDelete}
              />
              <EntityBoardActionBar />
              <EntityBoardContextMenu />
            </RecoilScope>
          </BoardOptionsContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
}
