import { t } from '@lingui/core/macro';

export const getDeleteCoreAgentsConfirmationContent = (
  numberOfCoreAgents: number,
) =>
  numberOfCoreAgents === 1
    ? {
        title: t`Delete agent?`,
        subtitle: t`This permanently deletes this agent. This action cannot be undone.`,
        confirmButtonText: t`Delete agent`,
      }
    : {
        title: t`Delete ${numberOfCoreAgents} agents?`,
        subtitle: t`This permanently deletes these ${numberOfCoreAgents} agents. This action cannot be undone.`,
        confirmButtonText: t`Delete agents`,
      };
