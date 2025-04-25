import { WorkflowDiagramCanvasContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasContainer';
import { WorkflowDiagramCanvasStatusTagContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramCanvasStatusTagContainer';
import { useTheme } from '@emotion/react';
import { Background, ReactFlow } from '@xyflow/react';
import { Tag, TagColor } from 'twenty-ui/components';

export const WorkflowDiagramCanvasSkeleton = ({
  tagColor,
  tagText,
}: {
  tagColor: TagColor;
  tagText: string;
}) => {
  const theme = useTheme();

  return (
    <WorkflowDiagramCanvasContainer>
      <ReactFlow
        nodes={[]}
        edges={[]}
        proOptions={{ hideAttribution: true }}
        preventScrolling={false}
      >
        <Background color={theme.border.color.medium} size={2} />
      </ReactFlow>

      <WorkflowDiagramCanvasStatusTagContainer>
        <Tag color={tagColor} text={tagText} />
      </WorkflowDiagramCanvasStatusTagContainer>
    </WorkflowDiagramCanvasContainer>
  );
};
