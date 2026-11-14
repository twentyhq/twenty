import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useStore } from 'jotai';
import { delay, graphql, HttpResponse } from 'msw';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SidePanelStartAppConversationPage } from '@/side-panel/pages/start-app-conversation/components/SidePanelStartAppConversationPage';
import { startAppConversationTargetComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const STORY_PAGE_INSTANCE_ID = 'side-panel-start-app-conversation-story';

type SidePanelStartAppConversationStoryProps = {
  channelLabel: string;
};

const SidePanelStartAppConversationStory = ({
  channelLabel,
}: SidePanelStartAppConversationStoryProps) => {
  const store = useStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    store.set(
      startAppConversationTargetComponentState.atomFamily({
        instanceId: STORY_PAGE_INSTANCE_ID,
      }),
      {
        messageChannelId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        channelLabel,
        personId: '20202020-2f6b-4e2f-b024-3f4f6c2f9b24',
      },
    );
    setIsReady(true);
  }, [channelLabel, store]);

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: STORY_PAGE_INSTANCE_ID }}
    >
      {isReady && <SidePanelStartAppConversationPage />}
    </SidePanelPageComponentInstanceContext.Provider>
  );
};

const meta = {
  title: 'Modules/SidePanel/StartAppConversationPage',
  component: SidePanelStartAppConversationStory,
  args: { channelLabel: 'LinkedIn · Tim Apple' },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: {
    container: { width: 480, height: 720 },
    msw: { handlers: graphqlMocks.handlers },
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
    WorkspaceDecorator,
  ],
} satisfies Meta<typeof SidePanelStartAppConversationStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Send from LinkedIn · Tim Apple'),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: /^Send/ })).toBeDisabled();

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Message' }),
      'Hi Kimberly, nice to meet you!',
    );

    expect(canvas.getByRole('button', { name: /^Send/ })).toBeEnabled();
  },
};

export const LongChannelLabel: Story = {
  args: {
    channelLabel:
      'LinkedIn · Timothy Donald Cook, Chief Executive Officer at Apple Inc.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Send from LinkedIn · Timothy Donald Cook, Chief Executive Officer at Apple Inc.',
      ),
    ).toBeVisible();
  },
};

export const Sending: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('StartAppChannelConversation', async () => {
          await delay('infinite');
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textbox = await canvas.findByRole('textbox', { name: 'Message' });

    await userEvent.type(textbox, 'Hi Kimberly');
    await userEvent.click(canvas.getByRole('button', { name: /^Send/ }));

    await waitFor(() => expect(textbox).toBeDisabled());
    expect(canvas.getByRole('button', { name: /^Send/ })).toBeDisabled();
  },
};

export const FailedSend: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('StartAppChannelConversation', () =>
          HttpResponse.json({
            errors: [{ message: 'The provider refused the message' }],
          }),
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = within(canvasElement.ownerDocument.body);
    const textbox = await canvas.findByRole('textbox', { name: 'Message' });

    await userEvent.type(textbox, 'Hi Kimberly');
    await userEvent.click(canvas.getByRole('button', { name: /^Send/ }));

    expect(
      await screen.findByText('Could not start the conversation'),
    ).toBeVisible();
    expect(textbox).toHaveValue('Hi Kimberly');
    expect(canvas.getByRole('button', { name: /^Send/ })).toBeEnabled();
  },
};
