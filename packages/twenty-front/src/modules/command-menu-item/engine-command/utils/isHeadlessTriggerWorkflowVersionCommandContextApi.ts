import {
  type HeadlessCommandContextApi,
  type HeadlessTriggerWorkflowVersionCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';

export const isHeadlessTriggerWorkflowVersionCommandContextApi = (
  state: HeadlessCommandContextApi,
): state is HeadlessTriggerWorkflowVersionCommandContextApi =>
  'workflowId' in state;
