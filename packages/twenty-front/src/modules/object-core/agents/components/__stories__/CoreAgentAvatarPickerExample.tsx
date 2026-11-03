import { InMemoryCache } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { GraphQLError } from 'graphql';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';

import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';

import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { CoreAgentAvatarPicker } from '@/object-core/agents/components/CoreAgentAvatarPicker';
import { CORE_AGENT_AVATAR_STORY_AGENT } from '@/object-core/agents/components/__stories__/coreAgentAvatarStoryAgent';
import {
  FindOneAgentDocument,
  UpdateOneAgentDocument,
} from '~/generated-metadata/graphql';

const CoreAgentAvatarPickerStoryContent = () => {
  const { data } = useQuery(FindOneAgentDocument, {
    variables: { id: CORE_AGENT_AVATAR_STORY_AGENT.id },
  });
  const agent = data?.findOneAgent;

  if (!isDefined(agent)) {
    return <Text>Loading agent</Text>;
  }

  return (
    <Section.Root>
      <Section.Root role="group" aria-label="Editable agent">
        <CoreAgentAvatarPicker agent={agent} />
        <CoreAgentAvatar agent={agent} size={24} />
      </Section.Root>
      <Section.Root role="group" aria-label="Read-only agent">
        <Text>Read-only agent</Text>
        <CoreAgentAvatarPicker agent={agent} disabled />
      </Section.Root>
    </Section.Root>
  );
};

export const CoreAgentAvatarPickerExample = () => {
  const [store] = useState(() => createStore());
  const [cache] = useState(() => new InMemoryCache());
  const agentId = CORE_AGENT_AVATAR_STORY_AGENT.id;

  return (
    <Provider store={store}>
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: FindOneAgentDocument,
              variables: { id: agentId },
            },
            result: { data: { findOneAgent: CORE_AGENT_AVATAR_STORY_AGENT } },
          },
          {
            request: {
              query: UpdateOneAgentDocument,
              variables: { input: { id: agentId, avatarColor: 'red' } },
            },
            delay: 200,
            result: {
              errors: [
                new GraphQLError('Avatar update failed', {
                  extensions: { userFriendlyMessage: 'Avatar update failed' },
                }),
              ],
            },
          },
          {
            request: {
              query: UpdateOneAgentDocument,
              variables: { input: { id: agentId, avatarShape: 'flower' } },
            },
            delay: 200,
            result: {
              data: {
                updateOneAgent: {
                  ...CORE_AGENT_AVATAR_STORY_AGENT,
                  avatarColor: 'blue',
                  avatarShape: 'flower',
                },
              },
            },
          },
          {
            request: {
              query: UpdateOneAgentDocument,
              variables: { input: { id: agentId, avatarColor: 'green' } },
            },
            delay: 200,
            result: {
              data: {
                updateOneAgent: {
                  ...CORE_AGENT_AVATAR_STORY_AGENT,
                  avatarColor: 'green',
                  avatarShape: 'flower',
                },
              },
            },
          },
        ]}
      >
        <ToastStoryContainer>
          <CoreAgentAvatarPickerStoryContent />
        </ToastStoryContainer>
      </MockedProvider>
    </Provider>
  );
};
