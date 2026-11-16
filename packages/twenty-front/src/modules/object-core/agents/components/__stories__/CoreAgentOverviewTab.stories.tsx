import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CoreAgentOverviewTab } from '@/object-core/agents/components/CoreAgentOverviewTab';
import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { MOCK_CORE_AGENT_RUN_INSIGHTS } from '~/testing/mock-data/core-run-insights';

const meta: Meta<typeof CoreAgentOverviewTab> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentOverviewTab',
  component: CoreAgentOverviewTab,
  decorators: [
    (Story) => (
      <GraphWidgetTestWrapper>
        <div style={{ width: 960 }}>
          <Story />
        </div>
      </GraphWidgetTestWrapper>
    ),
    ComponentDecorator,
  ],
  args: {
    agentId: MOCK_CORE_AGENT_RUN_INSIGHTS.agentId,
    insights: MOCK_CORE_AGENT_RUN_INSIGHTS,
    isLoading: false,
    hasError: false,
  },
};

export default meta;

type Story = StoryObj<typeof CoreAgentOverviewTab>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Credits · 14d')).toBeVisible();
    expect(await canvas.findByText('Credits per day')).toBeVisible();
  },
};

export const Loading: Story = {
  args: { insights: null, isLoading: true },
};

export const ErrorState: Story = {
  args: { insights: null, hasError: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Could not load run insights'),
    ).toBeVisible();
  },
};
