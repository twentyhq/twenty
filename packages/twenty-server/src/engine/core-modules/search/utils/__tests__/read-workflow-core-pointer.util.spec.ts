import { readWorkflowCorePointer } from 'src/engine/core-modules/search/utils/read-workflow-core-pointer.util';

describe('readWorkflowCorePointer', () => {
  it('reads the core workflow id from a workflow record', () => {
    expect(
      readWorkflowCorePointer({
        record: { id: 'workspace-id', coreWorkflowId: 'core-id' },
        flatObjectMetadata: { nameSingular: 'workflow' },
      }),
    ).toBe('core-id');
  });

  it('returns null when the workflow row has no core pointer', () => {
    expect(
      readWorkflowCorePointer({
        record: { id: 'workspace-id', coreWorkflowId: null },
        flatObjectMetadata: { nameSingular: 'workflow' },
      }),
    ).toBeNull();
  });

  it('returns null for any other object even when a column collides', () => {
    expect(
      readWorkflowCorePointer({
        record: { id: 'company-id', coreWorkflowId: 'core-id' },
        flatObjectMetadata: { nameSingular: 'company' },
      }),
    ).toBeNull();
  });
});
