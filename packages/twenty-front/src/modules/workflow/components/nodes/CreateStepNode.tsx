import { IconButton } from '@/ui/input/button/components/IconButton';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { StyledTargetHandle } from '@/workflow/components/nodes/common/StyledTargetHandle';
import { Position } from '@xyflow/react';
import { IconPlus } from 'twenty-ui';

export const CreateStepNode = () => {
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
