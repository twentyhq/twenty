import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Section } from 'twenty-ui/components/layout';
import { SettingsAiBehaviorExample } from '~/pages/settings/ai/components/__stories__/SettingsAiBehaviorExample';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { settingsAiOverviewStoryParameters } from '~/pages/settings/ai/components/__stories__/settingsAiOverviewStoryParameters';
import { settingsAiOverviewStorySections } from '~/pages/settings/ai/components/__stories__/settingsAiOverviewStorySections';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const meta = {
  title: 'Pages/Settings/AI/Overview with behavior',
  component: SettingsAiOverview,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai',
    routeParams: {},
    mcpSection: settingsAiOverviewStorySections.mcpSection,
    workspaceInstructionsSection:
      settingsAiOverviewStorySections.workspaceInstructionsSection,
    systemPromptSection: settingsAiOverviewStorySections.systemPromptSection,
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
  },
  parameters: settingsAiOverviewStoryParameters,
} satisfies Meta<SettingsAiOverviewProps & PageDecoratorArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = await canvas.findAllByRole('heading', { level: 2 });

    expect(headings.map(({ textContent }) => textContent)).toEqual([
      'Avatar',
      'Behavior',
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
  },
};
