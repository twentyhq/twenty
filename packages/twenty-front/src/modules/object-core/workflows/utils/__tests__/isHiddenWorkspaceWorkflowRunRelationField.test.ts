import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';

describe('isHiddenWorkspaceWorkflowRunRelationField', () => {
  it.each(['workflow', 'workflowVersion'])(
    'should hide the %s relation field on a workflow run when the flag is on',
    (fieldName) => {
      expect(
        isHiddenWorkspaceWorkflowRunRelationField({
          objectNameSingular: CoreObjectNameSingular.WorkflowRun,
          fieldName,
          isWorkflowCoreIndexPageEnabled: true,
        }),
      ).toBe(true);
    },
  );

  it('should keep the workspace relation fields when the flag is off', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        fieldName: 'workflow',
        isWorkflowCoreIndexPageEnabled: false,
      }),
    ).toBe(false);
  });

  it('should keep the other workflow run fields when the flag is on', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        fieldName: 'status',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });

  it('should keep the workflow relation of other objects when the flag is on', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        fieldName: 'workflow',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });

  it('should keep the fields of a route without an object', () => {
    expect(
      isHiddenWorkspaceWorkflowRunRelationField({
        objectNameSingular: undefined,
        fieldName: 'workflow',
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });
});
