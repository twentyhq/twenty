import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Toaster } from 'twenty-ui/components/feedback';
import {
  AiChatAssistantMode,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
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
      <>
        <SettingsAI />
        <Toaster />
      </>
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
    expect(canvas.getByRole('heading', { name: 'Behavior' })).toBeVisible();
    expect(
      canvas.queryByRole('heading', { name: 'Avatar' }),
    ).not.toBeInTheDocument();

    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });
    expect(instructions).toHaveAttribute('contenteditable', 'true');
    await userEvent.type(instructions, 'Use concise replies.');
    expect(fixture.saveInstructions).not.toHaveBeenCalled();

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

export const BehaviorPersistence: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bodyQueries = within(canvasElement.ownerDocument.body);
    const directMessages = await canvas.findByRole('combobox', { name: 'DMs' });
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    expect(directMessages).toHaveTextContent('Only when mentioned');
    expect(inbox).toHaveTextContent('Auto');

    fixture.pauseBehaviorSave();
    await userEvent.click(directMessages);
    const directMessageOptions = await bodyQueries.findByRole('listbox', {
      name: 'DMs',
    });
    await userEvent.click(
      within(directMessageOptions).getByRole('option', { name: 'Never' }),
    );

    await waitFor(() => expect(fixture.saveBehavior).toHaveBeenCalledOnce());
    expect(fixture.saveBehavior).toHaveBeenLastCalledWith({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
    expect(directMessages).toHaveAttribute('data-disabled');
    expect(inbox).toHaveAttribute('data-disabled');
    expect(directMessages).toHaveTextContent('Only when mentioned');
    expect(inbox).toHaveTextContent('Auto');

    fixture.resumeBehaviorSave();
    await waitFor(() => expect(directMessages).toHaveTextContent('Never'));
    await waitFor(() => expect(inbox).not.toHaveAttribute('data-disabled'));
    await userEvent.click(inbox);
    const inboxOptions = await bodyQueries.findByRole('listbox', {
      name: 'Global inbox',
    });
    await userEvent.click(
      within(inboxOptions).getByRole('option', { name: 'Only when mentioned' }),
    );

    await waitFor(() => expect(inbox).toHaveTextContent('Only when mentioned'));
    expect(directMessages).toHaveTextContent('Never');
    expect(fixture.saveBehavior).toHaveBeenCalledTimes(2);
    expect(fixture.saveBehavior).toHaveBeenLastCalledWith({
      aiChatInboxAssistantMode: AiChatAssistantMode.MENTION_ONLY,
    });
    expect(fixture.saveInstructions).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    await fixture.reloadWorkspace();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));

    expect(
      await canvas.findByRole('combobox', { name: 'DMs' }),
    ).toHaveTextContent('Never');
    expect(
      canvas.getByRole('combobox', { name: 'Global inbox' }),
    ).toHaveTextContent('Only when mentioned');
    expect(fixture.saveBehavior).toHaveBeenCalledTimes(2);
  },
};

export const BehaviorSaveFailure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bodyQueries = within(canvasElement.ownerDocument.body);
    const directMessages = await canvas.findByRole('combobox', { name: 'DMs' });
    const inbox = canvas.getByRole('combobox', { name: 'Global inbox' });

    fixture.failNextBehaviorSave();
    await userEvent.click(directMessages);
    const failedOptions = await bodyQueries.findByRole('listbox', {
      name: 'DMs',
    });
    await userEvent.click(
      within(failedOptions).getByRole('option', { name: 'Never' }),
    );

    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save behavior settings. Try again.',
    );
    expect(directMessages).toHaveTextContent('Only when mentioned');
    expect(inbox).toHaveTextContent('Auto');
    expect(fixture.saveBehavior).toHaveBeenCalledOnce();

    await userEvent.click(directMessages);
    const retryOptions = await bodyQueries.findByRole('listbox', {
      name: 'DMs',
    });
    await userEvent.click(
      within(retryOptions).getByRole('option', { name: 'Never' }),
    );

    await waitFor(() => expect(directMessages).toHaveTextContent('Never'));
    expect(inbox).toHaveTextContent('Auto');
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    expect(fixture.saveBehavior).toHaveBeenCalledTimes(2);
    expect(fixture.saveBehavior).toHaveBeenLastCalledWith({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
    });
  },
};

export const InstructionsFailurePreservesBehavior: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bodyQueries = within(canvasElement.ownerDocument.body);
    const instructions = await canvas.findByRole('textbox', {
      name: 'Workspace Instructions',
    });
    const directMessages = canvas.getByRole('combobox', { name: 'DMs' });

    fixture.pauseInstructionsSave();
    fixture.failNextInstructionsSave();
    await userEvent.type(instructions, 'Use concise replies.');
    await waitFor(
      () => expect(fixture.instructionsSaveStarted).toHaveBeenCalledOnce(),
      { timeout: 3000 },
    );

    await userEvent.click(directMessages);
    const options = await bodyQueries.findByRole('listbox', { name: 'DMs' });
    await userEvent.click(
      within(options).getByRole('option', { name: 'Never' }),
    );
    await waitFor(() => expect(directMessages).toHaveTextContent('Never'));

    fixture.resumeInstructionsSave();
    expect(
      await bodyQueries.findByText('Workspace instructions could not be saved'),
    ).toBeVisible();
    expect(directMessages).toHaveTextContent('Never');
    expect(fixture.saveInstructions).not.toHaveBeenCalled();
    expect(fixture.saveBehavior).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));

    expect(
      await canvas.findByRole('combobox', { name: 'DMs' }),
    ).toHaveTextContent('Never');
    expect(
      canvas.getByRole('textbox', { name: 'Workspace Instructions' }),
    ).not.toHaveTextContent('Use concise replies.');
  },
};

export const LegacyTabsWithoutInbox: Story = {
  args: { isInboxEnabled: false, routeHash: '#overview' },
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
    expect(fixture.saveBehavior).not.toHaveBeenCalled();
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
    expect(fixture.saveBehavior).not.toHaveBeenCalled();
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
