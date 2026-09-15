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

const buildCoreWorkflow = ({
  currentVersion,
  workspaceWorkflowId = 'workspace-workflow-1',
}: {
  currentVersion: CoreWorkflowCurrentVersion | null;
  workspaceWorkflowId?: string | null;
}) => ({
  statuses: [],
  lastPublishedVersionId: null,
  workspaceWorkflowId,
  currentVersion,
});

describe('buildCommandMenuWorkflowsFromCore', () => {
  it('keys the workflow and its current version on workspace ids', () => {
    const result = buildCommandMenuWorkflowsFromCore([
      buildCoreWorkflow({
        currentVersion: buildCurrentVersion('workspace-version-1'),
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('workspace-workflow-1');
    expect(result[0]?.currentVersion.id).toBe('workspace-version-1');
    expect(result[0]?.currentVersion.workflowId).toBe('workspace-workflow-1');
    expect(result[0]?.currentVersion.trigger).toEqual({ type: 'MANUAL' });
  });

  it('omits a workflow that has no current version', () => {
    expect(
      buildCommandMenuWorkflowsFromCore([
        buildCoreWorkflow({ currentVersion: null }),
      ]),
    ).toEqual([]);
  });

  it('omits a workflow whose current version is not mirrored', () => {
    expect(
      buildCommandMenuWorkflowsFromCore([
        buildCoreWorkflow({ currentVersion: buildCurrentVersion(null) }),
      ]),
    ).toEqual([]);
  });

  it('omits a workflow with no workspace counterpart', () => {
    expect(
      buildCommandMenuWorkflowsFromCore([
        buildCoreWorkflow({
          currentVersion: buildCurrentVersion('workspace-version-1'),
          workspaceWorkflowId: null,
        }),
      ]),
    ).toEqual([]);
  });
});
