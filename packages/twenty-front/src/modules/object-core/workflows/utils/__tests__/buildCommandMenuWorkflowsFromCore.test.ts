import { type CoreWorkflowCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { buildCommandMenuWorkflowsFromCore } from '@/object-core/workflows/utils/buildCommandMenuWorkflowsFromCore';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

const buildCurrentVersion = (
  workspaceWorkflowVersionId: string | null,
): CoreWorkflowCurrentVersion => ({
  label: 'v1',
  status: CoreWorkflowVersionStatus.DRAFT,
  workspaceWorkflowVersionId,
  workspaceWorkflowId: 'workspace-workflow-1',
  trigger: { type: 'MANUAL' },
  steps: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const buildCoreWorkflow = (
  currentVersion: CoreWorkflowCurrentVersion | null,
) => ({
  id: 'core-workflow-1',
  statuses: [],
  lastPublishedVersionId: null,
  currentVersion,
});

describe('buildCommandMenuWorkflowsFromCore', () => {
  it('keys the workflow on its core id and the current version on workspace ids', () => {
    const result = buildCommandMenuWorkflowsFromCore([
      buildCoreWorkflow(buildCurrentVersion('workspace-version-1')),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('core-workflow-1');
    expect(result[0]?.currentVersion.id).toBe('workspace-version-1');
    expect(result[0]?.currentVersion.workflowId).toBe('workspace-workflow-1');
    expect(result[0]?.currentVersion.trigger).toEqual({ type: 'MANUAL' });
  });

  it('omits a workflow that has no current version', () => {
    expect(
      buildCommandMenuWorkflowsFromCore([buildCoreWorkflow(null)]),
    ).toEqual([]);
  });

  it('omits a workflow whose current version is not mirrored', () => {
    expect(
      buildCommandMenuWorkflowsFromCore([
        buildCoreWorkflow(buildCurrentVersion(null)),
      ]),
    ).toEqual([]);
  });
});
