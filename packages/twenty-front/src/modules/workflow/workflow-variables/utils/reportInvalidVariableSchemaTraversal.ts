const reportedInvalidVariableSchemaTraversalKeys = new Set<string>();

export const reportInvalidVariableSchemaTraversal = ({
  stepName,
  rawVariableName,
  pathSegment,
}: {
  stepName: string;
  rawVariableName: string;
  pathSegment: string;
}) => {
  const issueKey = `${stepName}:${rawVariableName}:${pathSegment}`;

  if (reportedInvalidVariableSchemaTraversalKeys.has(issueKey)) {
    return;
  }

  reportedInvalidVariableSchemaTraversalKeys.add(issueKey);

  void import('@sentry/react').then(({ captureMessage }) => {
    captureMessage('Workflow variable schema traversal skipped malformed node', {
      level: 'warning',
      tags: {
        area: 'workflow-variables',
      },
      contexts: {
        workflowVariableSchemaTraversal: {
          stepName,
          rawVariableName,
          pathSegment,
        },
      },
      fingerprint: [
        'workflow-variable-schema-traversal-malformed-node',
        stepName,
        pathSegment,
      ],
    });
  });
};
