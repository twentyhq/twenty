import {
  buildWorkflowFromCoreWorkflowWithVersions,
  buildWorkflowsWithCurrentVersionsFromCore,
} from '@/object-core/workflows/utils/buildWorkflowsWithCurrentVersionsFromCore';
import { getCurrentWorkflowVersionId } from '@/command-menu-item/utils/getCurrentWorkflowVersionId';
import {
  CoreWorkflowVersionStatus,
  type GetCoreWorkflowsWithVersionsQuery,
  type GetCoreWorkflowVersionsByIdsQuery,
} from '~/generated/graphql';

type CoreWorkflow =
  GetCoreWorkflowsWithVersionsQuery['coreWorkflowsWithVersions'][number];
type CoreVersion =
  GetCoreWorkflowVersionsByIdsQuery['coreWorkflowVersionsByIds'][number];

const buildCoreVersion = ({
  id,
  workspaceWorkflowVersionId,
  status = CoreWorkflowVersionStatus.ARCHIVED,
  createdAt = '2026-01-01T00:00:00.000Z',
}: {
  id: string;
  workspaceWorkflowVersionId: string | null;
  status?: CoreWorkflowVersionStatus;
  createdAt?: string;
}) => ({
  __typename: 'CoreWorkflowVersionDTO' as const,
  id,
  label: `v${id}`,
  status,
  workspaceWorkflowVersionId,
  workspaceWorkflowId: 'workspace-workflow-1',
  createdAt,
  updatedAt: createdAt,
});

const buildCoreWorkflow = (versions: CoreWorkflow['versions']): CoreWorkflow =>
  ({
    __typename: 'CoreWorkflowWithVersionsDTO',
    id: 'core-workflow-1',
    name: 'My workflow',
    statuses: [],
    lastPublishedVersionId: null,
    workspaceWorkflowId: 'workspace-workflow-1',
    versions,
  }) as CoreWorkflow;

describe('buildWorkflowFromCoreWorkflowWithVersions', () => {
  it('keys the workflow and its versions on workspace ids', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow([
        buildCoreVersion({
          id: 'core-version-1',
          workspaceWorkflowVersionId: 'workspace-version-1',
        }),
      ]),
    );

    expect(workflow?.id).toBe('workspace-workflow-1');
    expect(workflow?.versions.map((version) => version.id)).toEqual([
      'workspace-version-1',
    ]);
  });

  it('drops versions that have no workspace counterpart', () => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(
      buildCoreWorkflow([
        buildCoreVersion({
          id: 'core-version-1',
          workspaceWorkflowVersionId: null,
        }),
      ]),
    );

    expect(workflow?.versions).toEqual([]);
  });
});

describe('buildWorkflowsWithCurrentVersionsFromCore', () => {
  const draftVersion = buildCoreVersion({
    id: 'core-version-2',
    workspaceWorkflowVersionId: 'workspace-version-2',
    status: CoreWorkflowVersionStatus.DRAFT,
    createdAt: '2026-01-02T00:00:00.000Z',
  });

  it('attaches the current version content to its workflow', () => {
    const result = buildWorkflowsWithCurrentVersionsFromCore({
      coreWorkflows: [buildCoreWorkflow([draftVersion])],
      coreWorkflowVersionsWithContent: [
        {
          ...draftVersion,
          trigger: { type: 'MANUAL' },
          steps: [],
        } as unknown as CoreVersion,
      ],
      getCurrentVersionId: getCurrentWorkflowVersionId,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.currentVersion.id).toBe('workspace-version-2');
    expect(result[0]?.currentVersion.trigger).toEqual({ type: 'MANUAL' });
  });

  it('omits a workflow whose current version content is missing', () => {
    const result = buildWorkflowsWithCurrentVersionsFromCore({
      coreWorkflows: [buildCoreWorkflow([draftVersion])],
      coreWorkflowVersionsWithContent: [],
      getCurrentVersionId: getCurrentWorkflowVersionId,
    });

    expect(result).toEqual([]);
  });

  it('omits a workflow with no versions at all', () => {
    const result = buildWorkflowsWithCurrentVersionsFromCore({
      coreWorkflows: [buildCoreWorkflow([])],
      coreWorkflowVersionsWithContent: [],
      getCurrentVersionId: getCurrentWorkflowVersionId,
    });

    expect(result).toEqual([]);
  });
});
