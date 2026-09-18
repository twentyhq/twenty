import { PermissionFlagType } from 'twenty-shared/constants';

import { buildCoreWorkflowBroadcastEvent } from 'src/engine/core-modules/workflow/utils/build-core-workflow-broadcast-event.util';

describe('buildCoreWorkflowBroadcastEvent', () => {
  it('builds a workflow event gated on the workflows permission flag', () => {
    expect(
      buildCoreWorkflowBroadcastEvent({
        operation: 'updated',
        coreWorkflowId: 'core-workflow-1',
      }),
    ).toEqual({
      type: 'updated',
      entityName: 'workflow',
      recordId: 'core-workflow-1',
      properties: { after: { id: 'core-workflow-1' } },
      requiredPermissionFlag: PermissionFlagType.WORKFLOWS,
    });
  });

  it('builds a version event carrying its parent workflow id', () => {
    expect(
      buildCoreWorkflowBroadcastEvent({
        operation: 'created',
        coreWorkflowId: 'core-workflow-1',
        coreWorkflowVersionId: 'core-version-1',
      }),
    ).toMatchObject({
      entityName: 'workflowVersion',
      recordId: 'core-version-1',
      properties: {
        after: { id: 'core-version-1', coreWorkflowId: 'core-workflow-1' },
      },
    });
  });

  it('puts the record in before for a deletion', () => {
    expect(
      buildCoreWorkflowBroadcastEvent({
        operation: 'deleted',
        coreWorkflowId: 'core-workflow-1',
        coreWorkflowVersionId: 'core-version-1',
      })?.properties,
    ).toEqual({
      before: { id: 'core-version-1', coreWorkflowId: 'core-workflow-1' },
    });
  });

  it('omits the parent when a version is not linked to a core workflow yet', () => {
    expect(
      buildCoreWorkflowBroadcastEvent({
        operation: 'updated',
        coreWorkflowId: null,
        coreWorkflowVersionId: 'core-version-1',
      })?.properties,
    ).toEqual({ after: { id: 'core-version-1' } });
  });

  it('builds nothing when neither id is known', () => {
    expect(
      buildCoreWorkflowBroadcastEvent({ operation: 'deleted' }),
    ).toBeNull();
  });
});
