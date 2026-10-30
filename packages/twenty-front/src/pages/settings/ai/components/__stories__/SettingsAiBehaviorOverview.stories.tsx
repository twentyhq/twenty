import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Section } from 'twenty-ui/components/layout';
import { SettingsAiBehaviorExample } from '~/pages/settings/ai/components/__stories__/SettingsAiBehaviorExample';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta = {
  title: 'Pages/Settings/AI/Overview with behavior',
  component: SettingsAiOverview,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai',
    routeParams: {},
    workspaceInstructions: '',
    onMcpSetup: fn(),
    onSystemPromptsOpen: fn(),
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
  parameters: { msw: graphqlMocks },
} satisfies Meta<SettingsAiOverviewProps & PageDecoratorArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headings = await canvas.findAllByRole('heading');

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
