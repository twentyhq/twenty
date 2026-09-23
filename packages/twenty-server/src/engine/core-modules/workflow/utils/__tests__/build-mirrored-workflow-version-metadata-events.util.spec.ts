import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { buildMirroredWorkflowVersionMetadataEvents } from 'src/engine/core-modules/workflow/utils/build-mirrored-workflow-version-metadata-events.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

const FLAT_WORKFLOW_VERSION = {
  id: 'core-workflow-version-id',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  universalIdentifier: 'universal-identifier',
  workflowId: 'workspace-workflow-id',
  coreWorkflowId: 'core-workflow-id',
  workspaceWorkflowVersionId: 'workspace-workflow-version-id',
  status: WorkflowVersionStatus.DRAFT,
  triggers: null,
  steps: [],
} as unknown as FlatWorkflowVersion;

describe('buildMirroredWorkflowVersionMetadataEvents', () => {
  it('should emit a created event when the version did not exist before the write', () => {
    const [event, ...otherEvents] = buildMirroredWorkflowVersionMetadataEvents({
      previousFlatWorkflowVersion: undefined,
      flatWorkflowVersion: FLAT_WORKFLOW_VERSION,
    });

    expect(otherEvents).toEqual([]);
    expect(event).toMatchObject({
      type: 'created',
      metadataName: 'workflowVersion',
      recordId: 'core-workflow-version-id',
      properties: {
        after: {
          id: 'core-workflow-version-id',
          coreWorkflowId: 'core-workflow-id',
        },
      },
    });
  });

  it('should emit an updated event carrying the status change of an activation', () => {
    const [event, ...otherEvents] = buildMirroredWorkflowVersionMetadataEvents({
      previousFlatWorkflowVersion: FLAT_WORKFLOW_VERSION,
      flatWorkflowVersion: {
        ...FLAT_WORKFLOW_VERSION,
        status: WorkflowVersionStatus.ACTIVE,
      },
    });

    expect(otherEvents).toEqual([]);
    expect(event).toMatchObject({
      type: 'updated',
      metadataName: 'workflowVersion',
      recordId: 'core-workflow-version-id',
      properties: {
        updatedFields: ['status'],
        diff: {
          status: {
            before: WorkflowVersionStatus.DRAFT,
            after: WorkflowVersionStatus.ACTIVE,
          },
        },
        after: { coreWorkflowId: 'core-workflow-id' },
      },
    });
  });

  it('should emit an updated event carrying the steps change of a step write', () => {
    const [event] = buildMirroredWorkflowVersionMetadataEvents({
      previousFlatWorkflowVersion: FLAT_WORKFLOW_VERSION,
      flatWorkflowVersion: {
        ...FLAT_WORKFLOW_VERSION,
        steps: [{ id: 'step-id' }],
      } as unknown as FlatWorkflowVersion,
    });

    expect(event).toMatchObject({
      type: 'updated',
      properties: { updatedFields: ['steps'] },
    });
  });

  it('should emit nothing when the write left the compared properties unchanged', () => {
    expect(
      buildMirroredWorkflowVersionMetadataEvents({
        previousFlatWorkflowVersion: FLAT_WORKFLOW_VERSION,
        flatWorkflowVersion: { ...FLAT_WORKFLOW_VERSION, steps: [] },
      }),
    ).toEqual([]);
  });
});
