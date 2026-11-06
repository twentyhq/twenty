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
const NOVA_PROFILE = SETTINGS_AI_ASSISTANT_PRESETS[2];

type SettingsAiAssistantNavigationStoryArgs = PageDecoratorArgs & {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
};

const meta = {
  title: 'Pages/Settings/AI/Assistant Navigation',
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
} satisfies Meta<SettingsAiAssistantNavigationStoryArgs>;

export default meta;
type Story = StoryObj<SettingsAiAssistantNavigationStoryArgs>;

export const PendingPresetStaysBusyAcrossNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const scout = await canvas.findByRole('radio', { name: 'Scout' });

    fixture.assistant.pauseSave();
    await userEvent.click(scout);
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    expect(
      canvas.queryByRole('radiogroup', { name: 'Assistant avatar' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    const avatarGroup = await canvas.findByRole('radiogroup', {
      name: 'Assistant avatar',
    });

    expect(avatarGroup).toHaveAttribute('aria-busy', 'true');
    expect(canvas.getByRole('button', { name: 'Customize' })).toBeDisabled();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();

    for (const radio of within(avatarGroup).getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    }

    await userEvent.click(canvas.getByRole('radio', { name: 'Nova' }));
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    fixture.assistant.resumeSave();
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Scout' })).toBeChecked(),
    );
    await waitFor(() =>
      expect(avatarGroup).toHaveAttribute('aria-busy', 'false'),
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'Nova' }));
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Nova' })).toBeChecked(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Customize' }),
      ).not.toBeDisabled(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Customize' }));
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await userEvent.clear(name);
    await userEvent.type(name, 'Orbit');
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(3),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Customize' }),
      ).not.toBeDisabled(),
    );
    expect(canvas.getByRole('button', { name: 'Customize' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      fixture.assistant.saveProfile.mock.calls.map(([input]) => input),
    ).toEqual([
      { aiChatAssistantProfile: SCOUT_PROFILE },
      { aiChatAssistantProfile: NOVA_PROFILE },
      { aiChatAssistantProfile: { displayName: 'Orbit' } },
    ]);
    expect(name).toHaveValue('Orbit');
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};

export const FailedQueueKeepsRetryAcrossNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = await canvas.findByRole('button', { name: 'Customize' });

    fixture.assistant.failNextSave();
    fixture.assistant.pauseSave();
    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await userEvent.clear(name);
    await userEvent.type(name, 'Nimbus');
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Cloud' }),
    );
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to customization' }),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    fixture.assistant.resumeSave();
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('link', { name: 'Models' }));
    await canvas.findByRole('heading', { name: 'Models' });
    await userEvent.click(canvas.getByRole('link', { name: 'Overview' }));
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );

    fixture.assistant.pauseSave();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2),
    );
    expect(canvas.getByRole('button', { name: 'Customize' })).toBeDisabled();
    fixture.assistant.resumeSave();
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(3),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Customize' }),
      ).not.toBeDisabled(),
    );
    expect(
      fixture.assistant.saveProfile.mock.calls.map(([input]) => input),
    ).toEqual([
      { aiChatAssistantProfile: { displayName: 'Nimbus' } },
      { aiChatAssistantProfile: { displayName: 'Nimbus' } },
      { aiChatAssistantProfile: { avatarShape: 'cloud' } },
    ]);
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Customize' }));
    expect(
      await body.findByRole('textbox', { name: 'Assistant name' }),
    ).toHaveValue('Nimbus');
    expect(body.getByRole('button', { name: /^Shape/ })).toHaveTextContent(
      'Cloud',
    );
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};
