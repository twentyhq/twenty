import { isDefined } from 'twenty-shared/utils';

import {
  type Workflow,
  type WorkflowVersion,
  type WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { type GetCoreWorkflowsWithVersionsQuery } from '~/generated/graphql';

type CoreWorkflowWithVersions =
  GetCoreWorkflowsWithVersionsQuery['coreWorkflowsWithVersions'][number];

type CoreCurrentVersion = NonNullable<
  CoreWorkflowWithVersions['currentVersion']
>;

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

export const buildWorkflowVersionFromCoreCurrentVersion = (
  coreCurrentVersion: CoreCurrentVersion,
): WorkflowVersion | undefined => {
  if (!isDefined(coreCurrentVersion.workspaceWorkflowVersionId)) {
    return undefined;
  }

  return {
    __typename: 'WorkflowVersion',
    id: coreCurrentVersion.workspaceWorkflowVersionId,
    name: coreCurrentVersion.label,
    createdAt: coreCurrentVersion.createdAt,
    updatedAt: coreCurrentVersion.updatedAt,
    workflowId: coreCurrentVersion.workspaceWorkflowId,
    trigger: coreCurrentVersion.trigger ?? null,
    steps: coreCurrentVersion.steps ?? null,
    status: coreCurrentVersion.status,
  };
};

export const buildWorkflowsWithCurrentVersionsFromCore = (
  coreWorkflows: CoreWorkflowWithVersions[],
): WorkflowWithCurrentVersion[] =>
  coreWorkflows.flatMap((coreWorkflow) => {
    const workflow = buildWorkflowFromCoreWorkflowWithVersions(coreWorkflow);

    if (!isDefined(workflow) || !isDefined(coreWorkflow.currentVersion)) {
      return [];
    }

    const currentVersion = buildWorkflowVersionFromCoreCurrentVersion(
      coreWorkflow.currentVersion,
    );

    return isDefined(currentVersion) ? [{ ...workflow, currentVersion }] : [];
  });
