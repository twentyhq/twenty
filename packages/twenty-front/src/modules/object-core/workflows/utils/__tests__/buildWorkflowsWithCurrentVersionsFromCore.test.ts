import {
  buildWorkflowFromCoreWorkflowWithVersions,
  buildWorkflowsWithCurrentVersionsFromCore,
} from '@/object-core/workflows/utils/buildWorkflowsWithCurrentVersionsFromCore';
import {
  CoreWorkflowVersionStatus,
  type GetCoreWorkflowsWithVersionsQuery,
} from '~/generated/graphql';

type CoreWorkflow =
  GetCoreWorkflowsWithVersionsQuery['coreWorkflowsWithVersions'][number];

const buildCoreVersion = ({
  workspaceWorkflowVersionId,
  status = CoreWorkflowVersionStatus.DRAFT,
}: {
  workspaceWorkflowVersionId: string | null;
  status?: CoreWorkflowVersionStatus;
}) => ({
  __typename: 'CoreWorkflowVersionDTO' as const,
  id: 'core-version-1',
  label: 'v1',
  status,
  workspaceWorkflowVersionId,
  workspaceWorkflowId: 'workspace-workflow-1',
  trigger: { type: 'MANUAL' },
  steps: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const buildCoreWorkflow = ({
  versions,
  currentVersion,
  workspaceWorkflowId = 'workspace-workflow-1',
}: {
  versions: unknown[];
  currentVersion: unknown;
  workspaceWorkflowId?: string | null;
}): CoreWorkflow =>
  ({
    __typename: 'CoreWorkflowWithVersionsDTO',
    id: 'core-workflow-1',
    name: 'My workflow',
    statuses: [],
    lastPublishedVersionId: null,
    workspaceWorkflowId,
    versions,
    currentVersion,
  }) as CoreWorkflow;

describe('buildWorkflowFromCoreWorkflowWithVersions', () => {
  it('keys the workflow and its versions on workspace ids', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow({
        versions: [
          buildCoreVersion({
            workspaceWorkflowVersionId: 'workspace-version-1',
          }),
        ],
        currentVersion: null,
      }),
    );

    expect(workflow?.id).toBe('workspace-workflow-1');
    expect(workflow?.versions.map((version) => version.id)).toEqual([
      'workspace-version-1',
    ]);
  });

  it('drops versions that have no workspace counterpart', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow({
        versions: [buildCoreVersion({ workspaceWorkflowVersionId: null })],
        currentVersion: null,
      }),
    );

    expect(workflow?.versions).toEqual([]);
  });

  it('returns nothing when the core row has no workspace counterpart', () => {
    expect(
      buildWorkflowFromCoreWorkflowWithVersions(
        buildCoreWorkflow({
          versions: [],
          currentVersion: null,
          workspaceWorkflowId: null,
        }),
      ),
    ).toBeUndefined();
  });
});

describe('buildWorkflowsWithCurrentVersionsFromCore', () => {
  it('attaches the current version with its content', () => {
    const currentVersion = buildCoreVersion({
      workspaceWorkflowVersionId: 'workspace-version-1',
    });

    const result = buildWorkflowsWithCurrentVersionsFromCore([
      buildCoreWorkflow({ versions: [currentVersion], currentVersion }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.currentVersion.id).toBe('workspace-version-1');
    expect(result[0]?.currentVersion.trigger).toEqual({ type: 'MANUAL' });
    expect(result[0]?.currentVersion.workflowId).toBe('workspace-workflow-1');
  });

  it('omits a workflow that has no current version', () => {
    expect(
      buildWorkflowsWithCurrentVersionsFromCore([
        buildCoreWorkflow({ versions: [], currentVersion: null }),
      ]),
    ).toEqual([]);
  });

  it('omits a workflow whose current version is not mirrored', () => {
    const currentVersion = buildCoreVersion({
      workspaceWorkflowVersionId: null,
    });

    expect(
      buildWorkflowsWithCurrentVersionsFromCore([
        buildCoreWorkflow({ versions: [currentVersion], currentVersion }),
      ]),
    ).toEqual([]);
  });
});
