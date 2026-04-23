import { type WorkflowConnection } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type Connection } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';

type AssertWorkflowConnectionOrThrow = (
  connection: Connection,
) => asserts connection is WorkflowConnection;

export const assertWorkflowConnectionOrThrow: AssertWorkflowConnectionOrThrow =
  (connection) => {
    if (
      !isDefined(connection.sourceHandle) ||
      !isDefined(connection.targetHandle)
    ) {
      throw new Error(
        'WorkflowConnection must have defined sourceHandle and targetHandle.',
      );
    }
  };
