import { isDefined } from 'twenty-shared/utils';

import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import {
  type GetCoreWorkflowVersionsByIdsQuery,
  type GetCoreWorkflowsWithVersionsQuery,
} from '~/generated/graphql';

type CoreWorkflowWithVersions =
  GetCoreWorkflowsWithVersionsQuery['coreWorkflowsWithVersions'][number];

type CoreWorkflowVersionWithContent =
  GetCoreWorkflowVersionsByIdsQuery['coreWorkflowVersionsByIds'][number];

export const buildWorkflowFromCoreWorkflowWithVersions = (
  coreWorkflow: CoreWorkflowWithVersions,
): Workflow | undefined => {
  if (!isDefined(coreWorkflow.workspaceWorkflowId)) {
    return undefined;
  }

  return {
    __typename: 'Workflow',
    id: coreWorkflow.workspaceWorkflowId,
    name: coreWorkflow.name ?? '',
    statuses: coreWorkflow.statuses,
    lastPublishedVersionId: coreWorkflow.lastPublishedVersionId ?? null,
    versions: coreWorkflow.versions.flatMap((coreWorkflowVersion) =>
      isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)
        ? [
            {
              id: coreWorkflowVersion.workspaceWorkflowVersionId,
              name: coreWorkflowVersion.label,
              status: coreWorkflowVersion.status,
              createdAt: coreWorkflowVersion.createdAt,
            },
          ]
        : [],
    ),
  };
};

export const buildWorkflowVersionFromCoreWorkflowVersion = (
  coreWorkflowVersion: CoreWorkflowVersionWithContent,
): WorkflowVersion | undefined => {
  if (!isDefined(coreWorkflowVersion.workspaceWorkflowVersionId)) {
    return undefined;
  }

  return {
    __typename: 'WorkflowVersion',
    id: coreWorkflowVersion.workspaceWorkflowVersionId,
    name: coreWorkflowVersion.label,
    createdAt: coreWorkflowVersion.createdAt,
    updatedAt: coreWorkflowVersion.updatedAt,
    workflowId: coreWorkflowVersion.workspaceWorkflowId,
    trigger: coreWorkflowVersion.trigger ?? null,
    steps: coreWorkflowVersion.steps ?? null,
    status: coreWorkflowVersion.status,
  };
};

export const buildWorkflowsWithCurrentVersionsFromCore = ({
  coreWorkflows,
  coreWorkflowVersionsWithContent,
  getCurrentVersionId,
}: {
  coreWorkflows: CoreWorkflowWithVersions[];
  coreWorkflowVersionsWithContent: CoreWorkflowVersionWithContent[];
  getCurrentVersionId: (workflow: Workflow) => string | undefined;
}): WorkflowWithCurrentVersion[] => {
  const currentVersionById = new Map(
    coreWorkflowVersionsWithContent.flatMap((coreWorkflowVersion) => {
      const workflowVersion =
        buildWorkflowVersionFromCoreWorkflowVersion(coreWorkflowVersion);

      return isDefined(workflowVersion)
        ? [[workflowVersion.id, workflowVersion] as const]
        : [];
    }),
  );

  return coreWorkflows.flatMap((coreWorkflow) => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(coreWorkflow);

    if (!isDefined(workflow)) {
      return [];
    }

    const currentVersionId = getCurrentVersionId(workflow);

    if (!isDefined(currentVersionId)) {
      return [];
    }

    const currentVersion = currentVersionById.get(currentVersionId);

    return isDefined(currentVersion) ? [{ ...workflow, currentVersion }] : [];
  });
};
