import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const getDeleteCoreAgentsConfirmationContent = (
  agentLabels: string[],
) => {
  const numberOfAgents = agentLabels.length;
  const [agentLabel] = agentLabels;

  if (numberOfAgents === 1 && isNonEmptyString(agentLabel)) {
    return {
      title: t`Delete agent?`,
      subtitle: t`This permanently deletes this agent. This action cannot be undone. Type "${agentLabel}" to confirm.`,
      confirmButtonText: t`Delete agent`,
      confirmationValue: agentLabel,
    };
  }

  const confirmationValue = t`DELETE`;

  return {
    title: t`Delete ${numberOfAgents} agents?`,
    subtitle: t`This permanently deletes these ${numberOfAgents} agents. This action cannot be undone. Type "${confirmationValue}" to confirm.`,
    confirmButtonText: t`Delete agents`,
    confirmationValue,
  };
};
