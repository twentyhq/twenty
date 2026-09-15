import {
  type CoreWorkflowCurrentVersion,
  type CoreWorkflowWithVersions,
} from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { buildWorkflowsWithCurrentVersionsFromCore } from '@/object-core/workflows/utils/buildWorkflowsWithCurrentVersionsFromCore';
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
): CoreWorkflowWithVersions => ({
  name: 'My workflow',
  statuses: [],
  lastPublishedVersionId: null,
  workspaceWorkflowId: 'workspace-workflow-1',
  versions: [],
  currentVersion,
});

describe('buildWorkflowsWithCurrentVersionsFromCore', () => {
  it('attaches the current version with its content', () => {
    const result = buildWorkflowsWithCurrentVersionsFromCore([
      buildCoreWorkflow(buildCurrentVersion('workspace-version-1')),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.currentVersion.id).toBe('workspace-version-1');
    expect(result[0]?.currentVersion.trigger).toEqual({ type: 'MANUAL' });
  });

  it('omits a workflow that has no current version', () => {
    expect(
      buildWorkflowsWithCurrentVersionsFromCore([buildCoreWorkflow(null)]),
    ).toEqual([]);
  });

  it('omits a workflow whose current version is not mirrored', () => {
    expect(
      buildWorkflowsWithCurrentVersionsFromCore([
        buildCoreWorkflow(buildCurrentVersion(null)),
      ]),
    ).toEqual([]);
  });
});
