import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { aiModelsState } from '@/client-config/states/aiModelsState';
import { GettingStartedStepAction } from '@/getting-started/components/GettingStartedStepAction';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockGettingStartedStepDefinitions } from '~/testing/mock-data/gettingStartedSteps';

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
};

export default meta;

type Story = StoryObj<typeof GettingStartedStepAction>;

export const Import: Story = {
  args: {
    stepDefinition: getMockStepDefinition(
      GettingStartedStepActionKey.IMPORT_DATA,
    ),
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

export const DataModelPrompt: Story = {
  args: {
    stepDefinition: {
      ...getMockStepDefinition(GettingStartedStepActionKey.FOLLOW_UP_DEALS),
      actionKey: GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
      promptLabel: 'Setup instructions',
      prompt:
        'Look at the data I imported and suggest the objects, fields and views I need to run my business. Ask me what I want to track before creating anything.',
    },
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
      await canvas.findByRole('group', { name: 'Setup instructions' }),
    ).toBeVisible();
  },
};

export const FollowUpPrompt: Story = {
  args: {
    stepDefinition: getMockStepDefinition(
      GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    ),
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
      await canvas.findByRole('group', { name: 'Follow-up instructions' }),
    ).toBeVisible();
  },
};
