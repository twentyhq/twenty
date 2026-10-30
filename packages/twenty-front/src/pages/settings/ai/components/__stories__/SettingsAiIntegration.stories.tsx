import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsAI } from '~/pages/settings/ai/SettingsAI';
import { createSettingsAiIntegrationStoryFixture } from '~/pages/settings/ai/components/__stories__/createSettingsAiIntegrationStoryFixture';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const fixture = createSettingsAiIntegrationStoryFixture();

type SettingsAiIntegrationStoryArgs = PageDecoratorArgs & {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
};

const meta = {
  title: 'Pages/Settings/AI/Integration',
  component: SettingsAI,
  decorators: [PageDecorator],
  args: {
    routePath: '/settings/ai',
    routeParams: {},
    additionalRoutes: ['/settings/profile'],
    permissionFlags: [
      PermissionFlagType.AI_SETTINGS,
      PermissionFlagType.AI,
      PermissionFlagType.WORKSPACE,
    ],
    isInboxEnabled: true,
  },
  beforeEach: async ({ args }) => {
    await fixture.reset({
      permissionFlags: args.permissionFlags,
      isInboxEnabled: args.isInboxEnabled,
    });
  },
  parameters: { mockingDate: null, msw: { handlers: fixture.handlers } },
  render: () => (
    <SettingsProtectedRouteWrapper
      settingsPermission={PermissionFlagType.AI_SETTINGS}
    >
      <SettingsAI />
    </SettingsProtectedRouteWrapper>
  ),
} satisfies Meta<SettingsAiIntegrationStoryArgs>;

export default meta;
type Story = StoryObj<SettingsAiIntegrationStoryArgs>;

export const OverviewNavigationAndInstructionsPersistence: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = await canvas.findByRole('link', {
      name: 'Overview',
    });

    await waitFor(() =>
      expect(overview).toHaveAttribute('aria-current', 'page'),
    );
    expect(canvas.getByRole('heading', { name: 'MCP Server' })).toBeVisible();
    expect(
      canvas.queryByRole('heading', { name: 'Behavior' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('heading', { name: 'Avatar' }),
    ).not.toBeInTheDocument();

    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });
    expect(instructions).toHaveAttribute('contenteditable', 'true');
    await userEvent.type(instructions, 'Use concise replies.');
    await waitFor(
      () => expect(fixture.saveInstructions).toHaveBeenCalledOnce(),
      { timeout: 3000 },
    );
    expect(fixture.saveInstructions).toHaveBeenCalledWith({
      aiAdditionalInstructions: expect.stringContaining('Use concise replies.'),
    });

    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    expect(
      canvas.queryByRole('heading', {
        name: 'Workspace Instructions',
      }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('heading', { name: 'System Prompt' }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(
      await canvas.findByRole('textbox', { name: 'Workspace Instructions' }),
    ).toHaveTextContent('Use concise replies.');
    expect(fixture.saveInstructions).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole('link', { name: 'Set up MCP' }));
    await waitFor(() =>
      expect(canvas.getByRole('link', { name: 'MCP' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
    expect(
      canvas.queryByRole('heading', {
        name: 'Workspace Instructions',
      }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(
      await canvas.findByRole('textbox', { name: 'Workspace Instructions' }),
    ).toHaveTextContent('Use concise replies.');
  },
};

export const LegacyTabsWithoutInbox: Story = {
  args: { isInboxEnabled: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mcp = await canvas.findByRole('link', { name: 'MCP' });

    await waitFor(() => expect(mcp).toHaveAttribute('aria-current', 'page'));
    expect(
      canvas.queryByRole('link', { name: 'Overview' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('heading', { name: 'Behavior' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    expect(
      await canvas.findByRole('textbox', { name: 'Workspace Instructions' }),
    ).toHaveAttribute('contenteditable', 'true');
    expect(
      canvas.getByRole('heading', { name: 'System Prompt' }),
    ).toBeVisible();
  },
};

export const SettingsPermissionDenied: Story = {
  args: {
    permissionFlags: [PermissionFlagType.AI, PermissionFlagType.WORKSPACE],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Navigated to /settings/profile'),
    ).toBeVisible();
    expect(
      canvas.queryByRole('textbox', { name: 'Workspace Instructions' }),
    ).not.toBeInTheDocument();
    expect(fixture.loadSystemPrompts).not.toHaveBeenCalled();
    expect(fixture.saveInstructions).not.toHaveBeenCalled();
  },
};

export const ReadOnlyInstructionsWithoutAiAccess: Story = {
  args: { permissionFlags: [PermissionFlagType.AI_SETTINGS] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });

    expect(instructions).toHaveAttribute('contenteditable', 'false');
    expect(canvas.getByRole('link', { name: 'Set up MCP' })).toBeVisible();
    expect(
      canvas.queryByRole('link', { name: 'Read system prompts' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Expand to full screen' }),
    ).not.toBeInTheDocument();
    expect(fixture.loadSystemPrompts).not.toHaveBeenCalled();
    expect(fixture.saveInstructions).not.toHaveBeenCalled();
  },
};
