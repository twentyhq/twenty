import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  GettingStartedStepActionKey,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

const CHAT_THREAD_ID = '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90';

const StyledFrame = styled.div`
  padding: ${themeCssVariables.spacing[6]};
  width: 660px;
`;

const getMockStepDefinition = (actionKey: GettingStartedStepActionKey) => {
  const stepDefinition = mockGettingStartedStepDefinitions.find(
    (mockStepDefinition) => mockStepDefinition.actionKey === actionKey,
  );

  if (!isDefined(stepDefinition)) {
    throw new Error(`Missing mock step ${actionKey}`);
  }

  return stepDefinition;
};

const WORKSPACE_INVITATIONS_MOCK: MockedResponse = {
  request: { query: GetWorkspaceInvitationsDocument },
  maxUsageCount: Infinity,
  result: {
    data: {
      findWorkspaceInvitations: ['marc@acme.com', 'sam@acme.com'].map(
        (email, index) => ({
          __typename: 'WorkspaceInvitation',
          id: `20202020-0000-4000-8000-00000000010${index}`,
          email,
          roleId: null,
          expiresAt: '2024-03-20T12:00:00.000Z',
        }),
      ),
    },
  },
};

const meta: Meta<typeof GettingStartedStepAction> = {
  title: 'Modules/GettingStarted/GettingStartedStepAction',
  component: GettingStartedStepAction,
  decorators: [
    (Story) => (
      <StyledFrame>
        <Story />
      </StyledFrame>
    ),
    ComponentWithRouterDecorator,
    (Story, { parameters }) => {
      const { apolloMocks }: { apolloMocks?: MockedResponse[] } = parameters;

      return (
        <MockedProvider mocks={apolloMocks}>
          <Story />
        </MockedProvider>
      );
    },
  ],
  args: { isCompleted: true },
};

export default meta;

type Story = StoryObj<typeof GettingStartedStepAction>;

export const InviteDone: Story = {
  args: {
    stepDefinition: getMockStepDefinition(
      GettingStartedStepActionKey.INVITE_TEAM,
    ),
  },
  parameters: { apolloMocks: [WORKSPACE_INVITATIONS_MOCK] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: '2 invitations sent' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('textbox', { name: 'Teammate email 1' }),
    ).not.toBeInTheDocument();
  },
};

export const Import: Story = {
  args: {
    stepDefinition: getMockStepDefinition(
      GettingStartedStepActionKey.IMPORT_DATA,
    ),
    isCompleted: false,
  },
  decorators: [ToastDecorator],
  beforeEach: () => {
    jotaiStore.set(aiModelsState.atom, [
      { modelId: 'story-model', label: 'Story model' },
    ]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Upload your CRM export' }),
    ).toHaveTextContent('Drop your CSV or Excel from any tool');
    await expect(
      canvas.getByRole('button', { name: 'HubSpot' }),
    ).toHaveAttribute(
      'href',
      'https://knowledge.hubspot.com/import-and-export/export-records',
    );
  },
};

export const ImportDone: Story = {
  args: {
    stepDefinition: {
      ...getMockStepDefinition(GettingStartedStepActionKey.IMPORT_DATA),
      doneChatThreadId: CHAT_THREAD_ID,
    },
  },
  beforeEach: () => {
    jotaiStore.set(recordStoreFamilyState.atomFamily(CHAT_THREAD_ID), {
      __typename: 'AgentChatThread',
      id: CHAT_THREAD_ID,
      title: 'Import HubSpot contacts',
      lastActivityAt: MOCKED_DATE,
    });
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const importThreadCard = await canvas.findByRole('button', {
      name: /Import HubSpot contacts/,
    });

    await expect(
      canvas.queryByRole('button', { name: 'Upload your CRM export' }),
    ).not.toBeInTheDocument();

    await userEvent.click(importThreadCard);

    await waitFor(() =>
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
        CHAT_THREAD_ID,
      ),
    );
  },
};

export const PromptDoneWithoutThread: Story = {
  args: {
    stepDefinition: getMockStepDefinition(
      GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Follow-up instructions' }),
    ).not.toBeInTheDocument();
  },
};
