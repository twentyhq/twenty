import {
  type CoreWorkflowVersionMetadata,
  type CoreWorkflowWithVersions,
} from '@/object-core/workflows/types/CoreWorkflowEnrichmentTypes';
import { buildWorkflowFromCoreWorkflowWithVersions } from '@/object-core/workflows/utils/buildWorkflowFromCoreWorkflowWithVersions';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

const buildVersionMetadata = (
  workspaceWorkflowVersionId: string | null,
): CoreWorkflowVersionMetadata => ({
  label: 'v1',
  status: CoreWorkflowVersionStatus.DRAFT,
  workspaceWorkflowVersionId,
  createdAt: '2026-01-01T00:00:00.000Z',
});

const buildCoreWorkflow = ({
  versions,
  workspaceWorkflowId = 'workspace-workflow-1',
}: {
  versions: CoreWorkflowVersionMetadata[];
  workspaceWorkflowId?: string | null;
}): CoreWorkflowWithVersions => ({
  name: 'My workflow',
  statuses: [],
  lastPublishedVersionId: null,
  workspaceWorkflowId,
  versions,
});

describe('buildWorkflowFromCoreWorkflowWithVersions', () => {
  it('keys the workflow and its versions on workspace ids', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow({
        versions: [buildVersionMetadata('workspace-version-1')],
      }),
    );

    expect(workflow?.id).toBe('workspace-workflow-1');
    expect(workflow?.versions.map((version) => version.id)).toEqual([
      'workspace-version-1',
    ]);
  });

  it('drops versions that have no workspace counterpart', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow({ versions: [buildVersionMetadata(null)] }),
    );

    expect(workflow?.versions).toEqual([]);
  });

  it('returns nothing when the core row has no workspace counterpart', () => {
    expect(
      buildWorkflowFromCoreWorkflowWithVersions(
        buildCoreWorkflow({ versions: [], workspaceWorkflowId: null }),
      ),
    ).toBeUndefined();
  });
});
