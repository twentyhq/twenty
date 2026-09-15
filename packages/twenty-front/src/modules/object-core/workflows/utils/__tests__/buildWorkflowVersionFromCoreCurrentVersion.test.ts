import { type CoreWorkflowCurrentVersion } from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { buildWorkflowVersionFromCoreCurrentVersion } from '@/object-core/workflows/utils/buildWorkflowVersionFromCoreCurrentVersion';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

const buildCurrentVersion = (
  workspaceWorkflowVersionId: string | null,
): CoreWorkflowCurrentVersion => ({
  label: 'v2',
  status: CoreWorkflowVersionStatus.DRAFT,
  workspaceWorkflowVersionId,
  workspaceWorkflowId: 'workspace-workflow-1',
  trigger: { type: 'MANUAL' },
  steps: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
});

describe('buildWorkflowVersionFromCoreCurrentVersion', () => {
  it('keys the version on its workspace id and carries its content', () => {
    const workflowVersion = buildWorkflowVersionFromCoreCurrentVersion(
      buildCurrentVersion('workspace-version-1'),
    );

    expect(workflowVersion?.id).toBe('workspace-version-1');
    expect(workflowVersion?.workflowId).toBe('workspace-workflow-1');
    expect(workflowVersion?.name).toBe('v2');
    expect(workflowVersion?.trigger).toEqual({ type: 'MANUAL' });
  });

  it('returns nothing when the version has no workspace counterpart', () => {
    expect(
      buildWorkflowVersionFromCoreCurrentVersion(buildCurrentVersion(null)),
    ).toBeUndefined();
  });
});
