import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type CoreWorkflowBroadcastRecord } from '@/object-core/workflows/types/CoreWorkflowBroadcastRecord';
import { isCoreWorkflowEventRelevant } from '@/object-core/workflows/utils/isCoreWorkflowEventRelevant';

const workflowUpdated = (
  id: string,
): MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord> => ({
  metadataName: 'workflow',
  operation: { type: 'update', updatedRecord: { id } },
});

const versionCreated = (
  coreWorkflowId: string,
): MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord> => ({
  metadataName: 'workflowVersion',
  operation: {
    type: 'create',
    createdRecord: { id: 'core-version-1', coreWorkflowId },
  },
});

describe('isCoreWorkflowEventRelevant', () => {
  it('accepts every event when no workflow is scoped', () => {
    expect(
      isCoreWorkflowEventRelevant(workflowUpdated('other'), undefined),
    ).toBe(true);
  });

  it('accepts an event for the scoped workflow', () => {
    expect(
      isCoreWorkflowEventRelevant(
        workflowUpdated('core-workflow-1'),
        'core-workflow-1',
      ),
    ).toBe(true);
  });

  it('rejects an event for another workflow', () => {
    expect(
      isCoreWorkflowEventRelevant(
        workflowUpdated('core-workflow-2'),
        'core-workflow-1',
      ),
    ).toBe(false);
  });

  it('accepts a version event of the scoped workflow', () => {
    expect(
      isCoreWorkflowEventRelevant(
        versionCreated('core-workflow-1'),
        'core-workflow-1',
      ),
    ).toBe(true);
  });

  it('rejects a version event of another workflow', () => {
    expect(
      isCoreWorkflowEventRelevant(
        versionCreated('core-workflow-2'),
        'core-workflow-1',
      ),
    ).toBe(false);
  });

  it('accepts a workflow deletion of the scoped workflow only', () => {
    const deletion = (
      deletedRecordId: string,
    ): MetadataOperationBrowserEventDetail<CoreWorkflowBroadcastRecord> => ({
      metadataName: 'workflow',
      operation: { type: 'delete', deletedRecordId },
    });

    expect(
      isCoreWorkflowEventRelevant(
        deletion('core-workflow-1'),
        'core-workflow-1',
      ),
    ).toBe(true);
    expect(
      isCoreWorkflowEventRelevant(
        deletion('core-workflow-2'),
        'core-workflow-1',
      ),
    ).toBe(false);
  });

  it('accepts a version event whose parent is not linked yet', () => {
    expect(
      isCoreWorkflowEventRelevant(
        {
          metadataName: 'workflowVersion',
          operation: {
            type: 'update',
            updatedRecord: { id: 'core-version-1' },
          },
        },
        'core-workflow-1',
      ),
    ).toBe(true);
  });

  it('accepts a version deletion since the parent is not carried', () => {
    expect(
      isCoreWorkflowEventRelevant(
        {
          metadataName: 'workflowVersion',
          operation: { type: 'delete', deletedRecordId: 'core-version-1' },
        },
        'core-workflow-1',
      ),
    ).toBe(true);
  });
});
