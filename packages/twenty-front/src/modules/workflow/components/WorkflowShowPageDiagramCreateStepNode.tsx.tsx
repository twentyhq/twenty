import { IconButton } from '@/ui/input/button/components/IconButton';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import styled from '@emotion/styled';
import { Handle, Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui';

export const StyledTargetHandle = styled(Handle)`
  visibility: hidden;
`;

export const WorkflowShowPageDiagramCreateStepNode = () => {
  const { openRightDrawer } = useRightDrawer();

  const handleCreateStepNodeButtonClick = () => {
    openRightDrawer(RightDrawerPages.Workflow);
  };

  return (
    <div>
      <StyledTargetHandle type="target" position={Position.Top} />

      <IconButton Icon={IconPlus} onClick={handleCreateStepNodeButtonClick} />
    </div>
  );
};
