import styled from '@emotion/styled';

import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineStages } from '@/pipeline/hooks/usePipelineStages';
import { IconTargetArrow } from '@/ui/display/icon';
import { BoardOptionsContext } from '@/ui/layout/board/contexts/BoardOptionsContext';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

const StyledBoardContainer = styled.div`
  display: flex;
  width: 100%;
`;

export const Opportunities = () => {
  const { handlePipelineStageAdd, handlePipelineStageDelete } =
    usePipelineStages();

  const [updatePipelineStage] = useUpdatePipelineStageMutation();

  const handleEditColumnTitle = (
    boardColumnId: string,
    newTitle: string,
    newColor: string,
  ) => {
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
  };

  return (
    <PageContainer>
      <RecoilScope>
        <PageHeader title="Opportunities" Icon={IconTargetArrow}>
          <PipelineAddButton />
        </PageHeader>
        <PageBody>
          <BoardOptionsContext.Provider value={opportunitiesBoardOptions}>
            <RecoilScope
              scopeId="opportunities"
              CustomRecoilScopeContext={CompanyBoardRecoilScopeContext}
            >
              <StyledBoardContainer>
                <CompanyBoard
                  onColumnAdd={handlePipelineStageAdd}
                  onColumnDelete={handlePipelineStageDelete}
                  onEditColumnTitle={handleEditColumnTitle}
                />
              </StyledBoardContainer>
            </RecoilScope>
          </BoardOptionsContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
};
