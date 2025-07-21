import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import styled from '@emotion/styled';
import { useState } from 'react';

import { IconButtonGroup } from 'twenty-ui/input';



type WorkflowDiagramEdgeV1Props = {
  labelY?: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeV1 = ({
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeV1Props) => {
  
};
