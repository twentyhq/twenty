import { t } from '@lingui/core/macro';

export const getOperationTypeLabel = (key: string): string => {
  switch (key) {
    case 'AI_CHAT_TOKEN':
      return t`AI Chat`;
    case 'AI_WORKFLOW_TOKEN':
      return t`AI Workflow`;
    case 'WORKFLOW_EXECUTION':
      return t`Workflow Execution`;
    case 'CODE_EXECUTION':
      return t`Code Execution`;
    default:
      return key;
  }
};
