// Executors with no logicFunction row: the prefix keeps their names out of the ids callers can choose.
// Each prefix must be unique and at most 27 characters, since Lambda names cap at 64.
export const NON_PERSISTED_EXECUTOR_NAME_PREFIXES = {
  WORKFLOW_CODE_STEP: 'workflow-code-step',
} as const;
