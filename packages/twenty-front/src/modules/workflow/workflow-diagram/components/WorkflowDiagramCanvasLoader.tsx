import { WorkflowDiagramCanvasSkeleton } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasSkeleton';
import { workflowDiagramStatusState } from '@/workflow/workflow-diagram/states/workflowDiagramStatusState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactFlowProvider } from '@xyflow/react';
import { useRecoilValue } from 'recoil';
import { TagColor } from 'twenty-ui/components';

const StyledContainer = styled.div`
  display: grid;
  height: 100%;

  & > * {
    grid-column: 1;
    grid-row: 1;
  }
`;

const StyledCanvasComponentWrapper = styled.div<{ hide: boolean }>`
  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}
`;

export const WorkflowDiagramCanvasLoader = ({
  canvasComponent,
  skeletonTagColor,
  skeletonTagText,
}: {
  canvasComponent: React.ReactNode;
  skeletonTagColor: TagColor;
  skeletonTagText: string;
}) => {
  const workflowDiagramStatus = useRecoilValue(workflowDiagramStatusState);

  return (
    <StyledContainer>
      <StyledCanvasComponentWrapper hide={workflowDiagramStatus !== 'done'}>
        {canvasComponent}
      </StyledCanvasComponentWrapper>

      {workflowDiagramStatus !== 'done' && (
        <div style={{ height: '100%' }}>
          <ReactFlowProvider>
            <WorkflowDiagramCanvasSkeleton
              tagColor={skeletonTagColor}
              tagText={skeletonTagText}
            />
          </ReactFlowProvider>
        </div>
      )}
    </StyledContainer>
  );
};
