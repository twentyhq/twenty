import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineStages } from '@/pipeline/hooks/usePipelineStages';
import { BoardOptionsContext } from '@/ui/board/contexts/BoardOptionsContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { IconTargetArrow } from '@/ui/icon';
import { PageBody } from '@/ui/layout/components/PageBody';
import { PageContainer } from '@/ui/layout/components/PageContainer';
import { PageHeader } from '@/ui/layout/components/PageHeader';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useUpdatePipelineStageMutation } from '~/generated/graphql';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

export function Opportunities() {
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
        <PageHeader title="Opportunities" Icon={IconTargetArrow}>
          <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
            <PipelineAddButton />
          </RecoilScope>
        </PageHeader>
        <PageBody>
          <BoardOptionsContext.Provider value={opportunitiesBoardOptions}>
            <RecoilScope
              scopeId="opportunities"
              CustomRecoilScopeContext={CompanyBoardRecoilScopeContext}
            >
              <CompanyBoard
                onColumnAdd={handlePipelineStageAdd}
                onColumnDelete={handlePipelineStageDelete}
                onEditColumnTitle={handleEditColumnTitle}
              />
            </RecoilScope>
          </BoardOptionsContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
}
