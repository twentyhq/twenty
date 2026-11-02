import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Text } from 'twenty-ui/primitives/typography';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { SettingsAiBehaviorExample } from '~/pages/settings/ai/components/__stories__/SettingsAiBehaviorExample';
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
    additionalRoutes: [getSettingsPath(SettingsPath.AiPrompts)],
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
      <SettingsAiBehaviorExample
        directMessageMode="MENTION_ONLY"
        inboxMode="AUTOMATIC"
        onDirectMessageModeChange={fn()}
        onInboxModeChange={fn()}
      />
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
    expect(canvas.getByRole('combobox', { name: 'DMs' })).toHaveTextContent(
      'Only when mentioned',
    );
    expect(
      canvas.getByRole('combobox', { name: 'Global inbox' }),
    ).toHaveTextContent('Auto');
    expect(canvas.getByText('Overview navigation')).toBeInTheDocument();
  },
};

export const SystemPromptsNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('link', { name: 'Read system prompts' }),
    );

    expect(
      await canvas.findByText(
        `Navigated to ${getSettingsPath(SettingsPath.AiPrompts)}`,
      ),
    ).toBeVisible();
  },
};
