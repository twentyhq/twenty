import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';

import { CoreAgentCreditsPerDayChart } from '@/object-core/agents/components/CoreAgentCreditsPerDayChart';
import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { MOCK_CORE_AGENT_RUN_INSIGHTS } from '~/testing/mock-data/core-run-insights';

const meta: Meta<typeof CoreAgentCreditsPerDayChart> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentCreditsPerDayChart',
  component: CoreAgentCreditsPerDayChart,
  decorators: [
    (Story) => (
      <GraphWidgetTestWrapper>
        <div style={{ width: 640 }}>
          <Story />
        </div>
      </GraphWidgetTestWrapper>
    ),
    ComponentDecorator,
  ],
  args: {
    agentId: MOCK_CORE_AGENT_RUN_INSIGHTS.agentId,
    dailyRunCounts: MOCK_CORE_AGENT_RUN_INSIGHTS.dailyRunCounts,
  },
};

export default meta;

type Story = StoryObj<typeof CoreAgentCreditsPerDayChart>;

export const Default: Story = {};

export const NoCredits: Story = {
  args: {
    dailyRunCounts: MOCK_CORE_AGENT_RUN_INSIGHTS.dailyRunCounts.map(
      (dailyRunCount) => ({ ...dailyRunCount, credits: 0 }),
    ),
  },
};
