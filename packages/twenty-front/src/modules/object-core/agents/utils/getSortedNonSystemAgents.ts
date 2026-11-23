export const getSortedNonSystemAgents = <
  TAgent extends { isSystem: boolean; label: string },
>(
  agents: TAgent[],
): TAgent[] =>
  agents
    .filter((agent) => !agent.isSystem)
    .sort((firstAgent, secondAgent) =>
      firstAgent.label.localeCompare(secondAgent.label),
    );
