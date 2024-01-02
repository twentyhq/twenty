import styled from '@emotion/styled';

import { CompanyBoard } from '@/companies/board/components/CompanyBoard';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PipelineAddButton } from '@/pipeline/components/PipelineAddButton';
import { usePipelineSteps } from '@/pipeline/hooks/usePipelineSteps';
import { PipelineStep } from '@/pipeline/types/PipelineStep';
import { IconTargetArrow } from '@/ui/display/icon';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';

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
      objectNameSingular: CoreObjectNameSingular.PipelineStep,
    });

  const handleEditColumnTitle = ({
    columnId,
    title,
    color,
  }: {
    columnId: string;
    title: string;
    color: string;
  }) => {
    updateOnePipelineStep?.({
      idToUpdate: columnId,
      updateOneRecordInput: { name: title, color },
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Opportunities" Icon={IconTargetArrow}>
        <PipelineAddButton />
      </PageHeader>
      <PageBody>
        <StyledBoardContainer>
          <CompanyBoard
            onColumnAdd={handlePipelineStepAdd}
            onColumnDelete={handlePipelineStepDelete}
            onEditColumnTitle={handleEditColumnTitle}
          />
        </StyledBoardContainer>
      </PageBody>
    </PageContainer>
  );
};
