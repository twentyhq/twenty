import { WORKFLOW_RUN_GROUP_KEY_KIND } from 'src/engine/core-modules/message-queue/constants/workflow-run-group-key-kind.constant';

export const buildWorkflowRunGroupKey = (workspaceId: string): string =>
  `${WORKFLOW_RUN_GROUP_KEY_KIND}:${workspaceId}`;
