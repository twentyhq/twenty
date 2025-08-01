import { useLingui } from '@lingui/react/macro';

import { H2Title } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  useFindAgentHandoffsQuery,
  useFindManyAgentsQuery,
} from '~/generated-metadata/graphql';
import { SettingsAgentHandoffForm } from './SettingsAgentHandoffForm';
import { SettingsAgentHandoffTable } from './SettingsAgentHandoffTable';

export const SettingsAgentHandoffSection = ({
  agentId,
}: {
  agentId: string;
}) => {
  const { t } = useLingui();

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery();
  const { data: handoffData, refetch: refetchHandoffTargets } =
    useFindAgentHandoffsQuery({
      variables: { input: { id: agentId } },
      skip: !agentId,
    });

  const handoffTargets = handoffData?.findAgentHandoffs || [];

  const availableAgentOptions =
    agentsData?.findManyAgents?.reduce<SelectOption[]>((acc, agent) => {
      if (
        agent.id !== agentId &&
        !handoffTargets.some((handoff: any) => handoff.toAgent.id === agent.id)
      ) {
        acc.push({
          label: agent.label,
          value: agent.id,
        });
      }
      return acc;
    }, []) || [];

  return (
    <Section>
      <H2Title
        title={t`Agent Handoffs`}
        description={t`Configure which agents this agent can hand off conversations to`}
      />

      <SettingsAgentHandoffTable
        agentId={agentId}
        handoffTargets={handoffTargets}
        onHandoffRemoved={refetchHandoffTargets}
      />

      <SettingsAgentHandoffForm
        agentId={agentId}
        availableAgentOptions={availableAgentOptions}
        agentsLoading={agentsLoading}
        onHandoffAdded={refetchHandoffTargets}
      />
    </Section>
  );
};
