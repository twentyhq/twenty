import styled from '@emotion/styled';

import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CompanyBoardRecoilScopeContext } from '@/companies/states/recoil-scope-contexts/CompanyBoardRecoilScopeContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineSteps } from '@/pipeline/hooks/usePipelineSteps';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { IconTargetArrow } from '@/ui/display/icon';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { BoardOptionsContext } from '@/ui/object/record-board/contexts/BoardOptionsContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { opportunitiesBoardOptions } from '~/pages/opportunities/opportunitiesBoardOptions';

const StyledBoardContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const Opportunities = () => {
  const { handlePipelineStepAdd, handlePipelineStepDelete } =
    usePipelineSteps();

  const { updateOneRecord: updateOnePipelineStep } =
    useUpdateOneRecord<PipelineStep>({
      objectNameSingular: 'pipelineStep',
    });

  const handleEditColumnTitle = (
    boardColumnId: string,
    newTitle: string,
    newColor: string,
  ) => {
    updateOnePipelineStep?.({
      idToUpdate: boardColumnId,
      input: {
        name: newTitle,
        color: newColor,
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
            <CompanyBoardRecoilScopeContext.Provider value="opportunities">
              <StyledBoardContainer>
                <CompanyBoard
                  onColumnAdd={handlePipelineStepAdd}
                  onColumnDelete={handlePipelineStepDelete}
                  onEditColumnTitle={handleEditColumnTitle}
                />
              </StyledBoardContainer>
            </CompanyBoardRecoilScopeContext.Provider>
          </BoardOptionsContext.Provider>
        </PageBody>
      </RecoilScope>
    </PageContainer>
  );
};
