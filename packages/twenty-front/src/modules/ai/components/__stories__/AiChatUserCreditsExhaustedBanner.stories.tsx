import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUsageDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const UserCreditsExhaustedStory = ({
  userCreditsFallback,
}: {
  userCreditsFallback: UserCreditsFallback;
}) => {
  const [store] = useState(() => {
    const storyStore = createStore();
    storyStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    storyStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      billingCustomer: { id: 'billing-customer', userCreditsFallback },
    });
    return storyStore;
  });

  return (
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUsageDocument },
            maxUsageCount: Infinity,
            result: {
              data: {
                aiChatUsage: null,
                aiChatUserCreditsUsage: {
                  __typename: 'AiChatUserCreditsUsage',
                  limitValue: 830000,
                  consumedValue: 830000,
                  periodEnd: new Date(
                    Date.now() + 6.5 * 86400000,
                  ).toISOString(),
                },
              },
            },
          },
        ]}
      >
        <AiChatUserCreditsExhaustedBanner />
      </MockedProvider>
    </Provider>
  );
};

const meta = {
  title: 'Modules/AI/AiChatUserCreditsExhaustedBanner',
  component: AiChatUserCreditsExhaustedBanner,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
} satisfies Meta<typeof AiChatUserCreditsExhaustedBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkspaceCreditsFallback: Story = {
  render: () => (
    <UserCreditsExhaustedStory
      userCreditsFallback={UserCreditsFallback.WORKSPACE_CREDITS}
    />
  ),
  play: async ({ canvasElement }) => {
    const notice = await within(canvasElement).findByText(
      'Using workspace credits for 7 days.',
    );

    await expect(notice.scrollWidth).toBeLessThanOrEqual(notice.clientWidth);
  },
};

export const StopFallback: Story = {
  render: () => (
    <UserCreditsExhaustedStory
      userCreditsFallback={UserCreditsFallback.STOP}
    />
  ),
  play: async ({ canvasElement }) => {
    const notice = await within(canvasElement).findByText(
      'Your AI credits renew in 7 days.',
    );

    await expect(notice.scrollWidth).toBeLessThanOrEqual(notice.clientWidth);
  },
};
