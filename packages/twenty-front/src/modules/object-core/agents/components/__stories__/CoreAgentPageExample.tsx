import { CoreAgentEditingScope } from '@/object-core/agents/components/CoreAgentEditingScope';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { CORE_AGENT_AVATAR_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentAvatarStoryAgent';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';

export const CoreAgentPageExample = () => {
  const { data } = useQuery(FindOneAgentDocument, {
    variables: { id: CORE_AGENT_AVATAR_STORY_AGENT.id },
  });
  const agent = data?.findOneAgent;
  return isDefined(agent) ? (
    <CoreAgentEditingScope agentId={agent.id}>
      <CoreAgentFormContent agent={agent} />
    </CoreAgentEditingScope>
  ) : null;
};
