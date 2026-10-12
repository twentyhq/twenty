import { t } from '@lingui/core/macro';

export const getDeleteCoreWorkflowsConfirmationContent = (
  numberOfCoreWorkflows: number,
) =>
  numberOfCoreWorkflows === 1
    ? {
        title: t`Delete workflow?`,
        subtitle: t`This permanently deletes this workflow and all its run history. This action cannot be undone.`,
        confirmButtonText: t`Delete workflow`,
      }
    : {
        title: t`Delete ${numberOfCoreWorkflows} workflows?`,
        subtitle: t`This permanently deletes these ${numberOfCoreWorkflows} workflows and all their run history. This action cannot be undone.`,
        confirmButtonText: t`Delete workflows`,
      };
