import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { CatalogDecorator } from 'twenty-ui/testing';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreAgentFormContent } from '@/object-core/agents/components/CoreAgentFormContent';
import { CORE_AGENTS_STORY_AGENTS } from '@/object-core/agents/components/__stories__/coreAgentsStoryAgents';
import { CORE_AGENT_DETAIL_TABS } from '@/object-core/agents/constants/CoreAgentDetailTabs';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type FindOneAgentQuery } from '~/generated-metadata/graphql';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const [storyAgent] = CORE_AGENTS_STORY_AGENTS;
const INITIAL_AGENT = {
  ...storyAgent,
  description: 'Saved description',
};
const REFRESHED_AGENT_LABEL = 'Updated by a teammate';
const REFRESHED_AGENT_PROMPT = 'Use the newest instructions from the server.';
const PENDING_DESCRIPTION = 'My pending description';

const AgentFormWithRefetch = ({
  agent: initialAgent,
}: {
  agent: FindOneAgentQuery['findOneAgent'];
}) => {
  const [agent, setAgent] = useState(initialAgent);

  return (
    <>
      <Button
        onClick={() =>
          setAgent((currentAgent) => ({
            ...currentAgent,
            label: REFRESHED_AGENT_LABEL,
            prompt: REFRESHED_AGENT_PROMPT,
          }))
        }
      >
        Refresh agent from server
      </Button>
      <CoreAgentFormContent agent={agent} />
    </>
  );
};

const meta = {
  title: 'Modules/ObjectCore/Agents/CoreAgentFormContent',
  component: CoreAgentFormContent,
  args: { agent: INITIAL_AGENT },
  decorators: [
    CatalogDecorator,
    IconsProviderDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    (Story) => (
      <HelmetProvider>
        <Story />
      </HelmetProvider>
    ),
  ],
  parameters: {
    catalog: { options: { elementContainer: { width: 1000, height: 1000 } } },
    msw: {
      handlers: [
        graphql.query('GetRoles', () =>
          HttpResponse.json({
            data: { getRoles: [], getPermissionFlags: [] },
          }),
        ),
        graphql.mutation('UpdateOneAgent', async () => {
          await delay('infinite');

          return HttpResponse.json({ data: { updateOneAgent: INITIAL_AGENT } });
        }),
      ],
    },
  },
  beforeEach: () => {
    mockedApolloClient.cache.restore({});
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(
      activeTabIdComponentState.atomFamily({
        instanceId: `${CORE_AGENT_DETAIL_TABS.COMPONENT_INSTANCE_ID}-${INITIAL_AGENT.id}`,
      }),
      CORE_AGENT_DETAIL_TABS.TABS_IDS.SETTINGS,
    );
  },
  render: ({ agent }) => <AgentFormWithRefetch agent={agent} />,
} satisfies Meta<typeof CoreAgentFormContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RefreshedFieldsPreservePendingEdits: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = await canvas.findByPlaceholderText(
      'Write a description for this agent',
    );

    await userEvent.clear(description);
    await userEvent.type(description, PENDING_DESCRIPTION);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh agent from server' }),
    );

    await expect(canvas.getByPlaceholderText('Enter agent name*')).toHaveValue(
      REFRESHED_AGENT_LABEL,
    );
    await expect(
      canvas.getByPlaceholderText(
        "Enter the system prompt that defines this agent's behavior and capabilities",
      ),
    ).toHaveValue(REFRESHED_AGENT_PROMPT);
    await expect(description).toHaveValue(PENDING_DESCRIPTION);
  },
};
