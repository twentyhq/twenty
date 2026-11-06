import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsAI } from '~/pages/settings/ai/SettingsAI';
import { createSettingsAiIntegrationStoryFixture } from '~/pages/settings/ai/components/__stories__/createSettingsAiIntegrationStoryFixture';
import { SETTINGS_AI_ASSISTANT_PRESETS } from '~/pages/settings/ai/constants/SettingsAiAssistantPresets';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';

const fixture = createSettingsAiIntegrationStoryFixture();
const SCOUT_PROFILE = SETTINGS_AI_ASSISTANT_PRESETS[1];

type SettingsAiAssistantIntegrationStoryArgs = PageDecoratorArgs & {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
  shouldFailAssistantLoad: boolean;
  shouldPauseAssistantLoad: boolean;
  hasInvalidAssistantProfile: boolean;
};

const meta = {
  title: 'Pages/Settings/AI/Assistant Integration',
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
    shouldFailAssistantLoad: false,
    shouldPauseAssistantLoad: false,
    hasInvalidAssistantProfile: false,
  },
  beforeEach: async ({ args }) => {
    await fixture.reset({
      permissionFlags: args.permissionFlags,
      isInboxEnabled: args.isInboxEnabled,
      shouldFailAssistantLoad: args.shouldFailAssistantLoad,
      shouldPauseAssistantLoad: args.shouldPauseAssistantLoad,
      hasInvalidAssistantProfile: args.hasInvalidAssistantProfile,
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
} satisfies Meta<SettingsAiAssistantIntegrationStoryArgs>;

export default meta;
type Story = StoryObj<SettingsAiAssistantIntegrationStoryArgs>;

export const PresetPersistenceAndReload: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ada = await canvas.findByRole('radio', { name: 'Ada' });
    const scout = canvas.getByRole('radio', { name: 'Scout' });

    expect(ada).toBeChecked();
    expect(fixture.assistant.loadProfile).not.toHaveBeenCalled();
    fixture.assistant.pauseSave();
    await userEvent.click(scout);
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledWith({
      aiChatAssistantProfile: SCOUT_PROFILE,
    });
    expect(ada).toBeChecked();
    expect(scout).not.toBeChecked();
    expect(
      canvas.getByRole('radiogroup', { name: 'Assistant avatar' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(canvas.getByRole('button', { name: 'Customize' })).toBeDisabled();

    fixture.assistant.resumeSave();
    await waitFor(() => expect(scout).toBeChecked());
    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await fixture.reloadWorkspace();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(await canvas.findByRole('radio', { name: 'Scout' })).toBeChecked();
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
  },
};

export const CustomPatchRetryAndReset: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = await canvas.findByRole('button', { name: 'Customize' });

    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    fixture.assistant.setProfile({ avatarColor: 'purple' });
    fixture.assistant.failNextSave();
    fixture.assistant.pauseSave();
    await userEvent.clear(name);
    await userEvent.type(name, '  Nimbus  ');
    expect(fixture.assistant.saveProfile).not.toHaveBeenCalled();
    await userEvent.tab();
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    expect(
      body.getByRole('dialog', { name: 'Customize assistant' }),
    ).toBeVisible();
    expect(name).toBeDisabled();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    fixture.assistant.resumeSave();
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledWith({
      aiChatAssistantProfile: { displayName: 'Nimbus' },
    });
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    await userEvent.keyboard('{Escape}');

    fixture.assistant.pauseSave();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenLastCalledWith({
      aiChatAssistantProfile: { displayName: 'Nimbus' },
    });
    expect(customize).toBeDisabled();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();

    fixture.assistant.resumeSave();
    await waitFor(() => expect(customize).not.toBeDisabled());
    await userEvent.click(customize);
    const savedName = await body.findByRole('textbox', {
      name: 'Assistant name',
    });

    await waitFor(() =>
      expect(body.getByRole('button', { name: /^Color/ })).toHaveTextContent(
        'Purple',
      ),
    );
    expect(savedName).toHaveValue('Nimbus');
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    fixture.assistant.failNextSave();
    fixture.assistant.pauseSave();
    await userEvent.click(body.getByRole('button', { name: 'Reset to Ada' }));
    await waitFor(() =>
      expect(fixture.assistant.resetProfile).toHaveBeenCalledOnce(),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2);
    expect(customize).toBeDisabled();
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    fixture.assistant.resumeSave();
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    expect(canvas.getByRole('radio', { name: 'Ada' })).not.toBeChecked();
    await userEvent.click(customize);
    expect(
      await body.findByRole('textbox', { name: 'Assistant name' }),
    ).toHaveValue('Nimbus');
    expect(body.getByRole('button', { name: /^Color/ })).toHaveTextContent(
      'Purple',
    );
    await userEvent.keyboard('{Escape}');

    fixture.assistant.pauseSave();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.resetProfile).toHaveBeenCalledTimes(2),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2);
    expect(customize).toHaveAttribute('aria-pressed', 'true');
    fixture.assistant.resumeSave();
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked(),
    );
    await userEvent.click(customize);
    expect(
      await body.findByRole('textbox', { name: 'Assistant name' }),
    ).toHaveValue('Ada');
    expect(body.getByRole('button', { name: /^Color/ })).toHaveTextContent(
      'Blue',
    );
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await fixture.reloadWorkspace();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(await canvas.findByRole('radio', { name: 'Ada' })).toBeChecked();
  },
};

export const LoadFailureAndRetry: Story = {
  args: {
    shouldFailAssistantLoad: true,
    shouldPauseAssistantLoad: true,
    hasInvalidAssistantProfile: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to load assistant settings. Try again.',
    );
    expect(
      canvas.queryByRole('radio', { name: 'Ada' }),
    ).not.toBeInTheDocument();
    expect(fixture.assistant.loadProfile).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.loadProfile).toHaveBeenCalledOnce(),
    );
    expect(
      await canvas.findByText('Loading assistant settings...'),
    ).toBeVisible();
    fixture.assistant.resumeLoad();
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to load assistant settings. Try again.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    expect(await canvas.findByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(fixture.assistant.loadProfile).toHaveBeenCalledTimes(2);
    expect(fixture.assistant.saveProfile).not.toHaveBeenCalled();
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
