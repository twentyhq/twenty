import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { settingsAiOverviewStoryParameters } from '~/pages/settings/ai/components/__stories__/settingsAiOverviewStoryParameters';
import { settingsAiOverviewStorySections } from '~/pages/settings/ai/components/__stories__/settingsAiOverviewStorySections';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const meta = {
  title: 'Pages/Settings/AI/Overview',
  component: SettingsAiOverview,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai',
    routeParams: {},
    mcpSection: settingsAiOverviewStorySections.mcpSection,
    workspaceInstructionsSection:
      settingsAiOverviewStorySections.workspaceInstructionsSection,
    systemPromptSection: settingsAiOverviewStorySections.systemPromptSection,
  },
  render: (args) => (
    <SettingsAiOverview
      avatarSection={args.avatarSection}
      behaviorSection={args.behaviorSection}
      summarySection={args.summarySection}
      secondaryBar={args.secondaryBar}
      mcpSection={args.mcpSection}
      workspaceInstructionsSection={args.workspaceInstructionsSection}
      systemPromptSection={args.systemPromptSection}
    />
  ),
  parameters: settingsAiOverviewStoryParameters,
} satisfies Meta<SettingsAiOverviewProps & PageDecoratorArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = await canvas.findAllByRole('heading', { level: 2 });

    expect(headings.map(({ textContent }) => textContent)).toEqual([
      'MCP Server',
      'Workspace Instructions',
      'System Prompt',
    ]);
  },
};

export const WithSections: Story = {
  args: {
    avatarSection: (
      <Section.Root>
        <Section.Header title="Avatar" />
      </Section.Root>
    ),
    behaviorSection: (
      <Section.Root>
        <Section.Header title="Behavior" />
      </Section.Root>
    ),
    summarySection: (
      <Section.Root>
        <Section.Header title="At a glance" />
      </Section.Root>
    ),
    secondaryBar: <Text>Overview navigation</Text>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = await canvas.findAllByRole('heading', { level: 2 });

    expect(headings.map(({ textContent }) => textContent)).toEqual([
      'Avatar',
      'Behavior',
      'At a glance',
      'MCP Server',
      'Workspace Instructions',
      'System Prompt',
    ]);
    expect(canvas.getByText('Overview navigation')).toBeInTheDocument();
  },
};
