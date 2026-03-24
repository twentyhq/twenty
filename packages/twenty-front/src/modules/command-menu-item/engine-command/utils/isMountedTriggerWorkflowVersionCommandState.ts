import {
  type MountedCommandState,
  type MountedTriggerWorkflowVersionCommandState,
} from '@/command-menu-item/engine-command/types/MountedCommandState';

export const isMountedTriggerWorkflowVersionCommandState = (
  state: MountedCommandState,
): state is MountedTriggerWorkflowVersionCommandState =>
  'workflowId' in state;
