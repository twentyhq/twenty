import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Section } from 'twenty-ui/components/layout';
import { SettingsAiOverview } from '~/pages/settings/ai/components/SettingsAiOverview';
import { type SettingsAiOverviewProps } from '~/pages/settings/ai/types/SettingsAiOverviewProps';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const ControlledOverview = ({
  avatarSection,
  behaviorSection,
  summarySection,
  secondaryBar,
  workspaceInstructions,
  onWorkspaceInstructionsChange,
  isWorkspaceInstructionsDisabled,
  onMcpSetup,
  onSystemPromptsOpen,
  systemPromptTokenCount,
}: SettingsAiOverviewProps) => {
  const [instructions, setInstructions] = useState(workspaceInstructions);

  return (
    <SettingsAiOverview
      avatarSection={avatarSection}
      behaviorSection={behaviorSection}
      summarySection={summarySection}
      secondaryBar={secondaryBar}
      workspaceInstructions={instructions}
      onWorkspaceInstructionsChange={(value) => {
        setInstructions(value);
        onWorkspaceInstructionsChange?.(value);
      }}
      isWorkspaceInstructionsDisabled={isWorkspaceInstructionsDisabled}
      onMcpSetup={onMcpSetup}
      onSystemPromptsOpen={onSystemPromptsOpen}
      systemPromptTokenCount={systemPromptTokenCount}
    />
  );
};

const meta = {
  title: 'Pages/Settings/AI/Overview',
  component: SettingsAiOverview,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai',
    routeParams: {},
    workspaceInstructions: '',
    onWorkspaceInstructionsChange: fn(),
    onMcpSetup: fn(),
    onSystemPromptsOpen: fn(),
    systemPromptTokenCount: 12400,
  },
  parameters: { msw: graphqlMocks },
} satisfies Meta<SettingsAiOverviewProps & PageDecoratorArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ControlledOverview
      workspaceInstructions={args.workspaceInstructions}
      onWorkspaceInstructionsChange={args.onWorkspaceInstructionsChange}
      onMcpSetup={args.onMcpSetup}
      onSystemPromptsOpen={args.onSystemPromptsOpen}
      systemPromptTokenCount={args.systemPromptTokenCount}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });

    await userEvent.type(instructions, 'Use a professional tone.');
    expect(instructions).toHaveValue('Use a professional tone.');
    expect(args.onWorkspaceInstructionsChange).toHaveBeenLastCalledWith(
      'Use a professional tone.',
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Set up MCP' }));
    expect(args.onMcpSetup).toHaveBeenCalledOnce();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Read system prompts' }),
    );
    expect(args.onSystemPromptsOpen).toHaveBeenCalledOnce();
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
  },
};

export const ReadOnly: Story = {
  args: {
    workspaceInstructions: 'Use a professional tone.',
    onWorkspaceInstructionsChange: undefined,
    onMcpSetup: undefined,
    onSystemPromptsOpen: undefined,
    systemPromptTokenCount: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });

    expect(instructions).toHaveAttribute('readonly');
    await userEvent.type(instructions, 'Changed');
    expect(instructions).toHaveValue('Use a professional tone.');
    expect(
      canvas.queryByRole('button', { name: 'Set up MCP' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Read system prompts' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.getByText(
        'Read the system prompts to understand how the AI works',
      ),
    ).toBeInTheDocument();
  },
};
