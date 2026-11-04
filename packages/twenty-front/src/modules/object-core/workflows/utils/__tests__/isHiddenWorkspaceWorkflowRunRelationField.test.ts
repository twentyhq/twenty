import { StandardObjectNameSingular } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

describe('isHiddenWorkspaceWorkflowRunRelationField', () => {
  it('should hide the workflowVersion relation field on a workflow run', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: StandardObjectNameSingular.WorkflowRun,
        fieldName: 'workflowVersion',
      }),
    ).toBe(true);
  });

  it('should keep the other workflow run fields', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: StandardObjectNameSingular.WorkflowRun,
        fieldName: 'status',
      }),
    ).toBe(false);
  });

  it('should keep the workflow relation of other objects', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: StandardObjectNameSingular.WorkflowVersion,
        fieldName: 'workflow',
      }),
    ).toBe(false);
  });

  it('should keep the fields of a route without an object', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: undefined,
        fieldName: 'workflow',
      }),
    ).toBe(false);
  });
});
