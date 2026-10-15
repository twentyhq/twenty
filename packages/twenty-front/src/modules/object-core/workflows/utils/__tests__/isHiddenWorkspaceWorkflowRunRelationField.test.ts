import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

describe('isHiddenWorkspaceWorkflowRunRelationField', () => {
  it('should hide the workflow relation field on a workflow run', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        fieldName: 'workflow',
      }),
    ).toBe(true);
  });

  it('should keep the other workflow run fields', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        fieldName: 'status',
      }),
    ).toBe(false);
  });

  it('should keep the workflow relation of other objects', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
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
