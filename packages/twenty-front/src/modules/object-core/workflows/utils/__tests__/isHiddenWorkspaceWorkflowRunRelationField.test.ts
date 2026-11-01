import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

describe('isHiddenWorkspaceWorkflowRunRelationField', () => {
  it.each(['workflow', 'workflowVersion'])(
    'should hide the %s relation field on a workflow run',
    (fieldName) => {
      expect(
        isHiddenWorkspaceWorkflowRunRelationField({
          objectNameSingular: CoreObjectNameSingular.WorkflowRun,
          fieldName,
        }),
      ).toBe(true);
    },
  );

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
