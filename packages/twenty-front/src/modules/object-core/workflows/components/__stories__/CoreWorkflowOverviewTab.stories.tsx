import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CoreWorkflowOverviewTab } from '@/object-core/workflows/components/CoreWorkflowOverviewTab';
import { GraphWidgetTestWrapper } from '@/page-layout/widgets/graph/__tests__/GraphWidgetTestWrapper';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { MOCK_CORE_WORKFLOW_RUN_INSIGHTS } from '~/testing/mock-data/core-run-insights';

const meta: Meta<typeof CoreWorkflowOverviewTab> = {
  title: 'Modules/ObjectCore/Workflows/CoreWorkflowOverviewTab',
  component: CoreWorkflowOverviewTab,
  decorators: [
    (Story) => (
      <GraphWidgetTestWrapper>
        <div style={{ width: 960 }}>
          <Story />
        </div>
      </GraphWidgetTestWrapper>
    ),
    ComponentWithRouterDecorator,
  ],
  args: {
    coreWorkflowId: MOCK_CORE_WORKFLOW_RUN_INSIGHTS.coreWorkflowId,
    insights: MOCK_CORE_WORKFLOW_RUN_INSIGHTS,
    isLoading: false,
    hasError: false,
  },
};

export default meta;

type Story = StoryObj<typeof CoreWorkflowOverviewTab>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Failure rate')).toBeVisible();
    expect(await canvas.findByText('Enrich new company #57')).toBeVisible();
  },
};

export const Loading: Story = {
  args: { insights: null, isLoading: true },
};

export const ErrorState: Story = {
  args: { insights: null, hasError: true },
};
