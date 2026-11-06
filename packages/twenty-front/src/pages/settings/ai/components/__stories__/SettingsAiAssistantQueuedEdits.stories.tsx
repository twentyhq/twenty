import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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

type SettingsAiAssistantQueuedEditsStoryArgs = PageDecoratorArgs & {
  permissionFlags: PermissionFlagType[];
  isInboxEnabled: boolean;
};

const meta = {
  title: 'Pages/Settings/AI/Assistant Queued Edits',
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
} satisfies Meta<SettingsAiAssistantQueuedEditsStoryArgs>;

export default meta;
type Story = StoryObj<SettingsAiAssistantQueuedEditsStoryArgs>;

export const NameBlurPreservesQueuedEditsThroughRetry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = await canvas.findByRole('button', { name: 'Customize' });

    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    fixture.assistant.failNextSave();
    fixture.assistant.pauseSave();
    await userEvent.clear(name);
    await userEvent.type(name, 'Nimbus');
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));
    const cloud = await body.findByRole('menuitemradio', { name: 'Cloud' });

    expect(cloud).toBeVisible();
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledWith({
      aiChatAssistantProfile: { displayName: 'Nimbus' },
    });
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();
    await userEvent.click(cloud);
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to customization' }),
    );
    const animate = await body.findByRole('switch', { name: 'Animate' });

    expect(animate).toBeChecked();
    await userEvent.click(animate);
    await userEvent.click(body.getByRole('button', { name: 'Reset to Ada' }));
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();

    fixture.assistant.resumeSave();
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked();

    fixture.assistant.saveProfile.mockClear();
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.resetProfile).toHaveBeenCalledOnce(),
    );
    expect(
      fixture.assistant.saveProfile.mock.calls.map(([input]) => input),
    ).toEqual([
      { aiChatAssistantProfile: { displayName: 'Nimbus' } },
      { aiChatAssistantProfile: { avatarShape: 'cloud' } },
      { aiChatAssistantProfile: { isAvatarAnimated: false } },
    ]);
    expect(
      fixture.assistant.saveProfile.mock.invocationCallOrder[2],
    ).toBeLessThan(fixture.assistant.resetProfile.mock.invocationCallOrder[0]);
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Ada' })).toBeChecked(),
    );
    expect(customize).toHaveAttribute('aria-pressed', 'false');
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};

export const RevertedNameReplacesFailedSaveBeforeRetry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = await canvas.findByRole('button', { name: 'Customize' });

    fixture.assistant.failNextSave();
    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    await userEvent.clear(name);
    await userEvent.type(name, 'Nimbus');
    await userEvent.keyboard('{Enter}');
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    await waitFor(() => expect(name).not.toBeDisabled());
    await userEvent.keyboard('{Escape}');
    await userEvent.click(customize);
    const reopenedName = await body.findByRole('textbox', {
      name: 'Assistant name',
    });

    await userEvent.clear(reopenedName);
    await userEvent.type(reopenedName, 'Ada');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(customize).not.toBeDisabled());
    expect(
      jotaiStore.get(currentWorkspaceState.atom)?.aiChatAssistantProfile
        .displayName,
    ).toBe('Ada');
    expect(
      fixture.assistant.saveProfile.mock.calls.map(([input]) => input),
    ).toEqual([
      { aiChatAssistantProfile: { displayName: 'Nimbus' } },
      { aiChatAssistantProfile: { displayName: 'Ada' } },
    ]);
  },
};

export const QueuedEditRetriesAfterHydrationResumes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const customize = await canvas.findByRole('button', { name: 'Customize' });

    await userEvent.click(customize);
    const name = await body.findByRole('textbox', { name: 'Assistant name' });

    fixture.assistant.pauseSave();
    await userEvent.clear(name);
    await userEvent.type(name, 'Orbit');
    await userEvent.click(body.getByRole('button', { name: /^Shape/ }));
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Cloud' }),
    );
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce(),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledWith({
      aiChatAssistantProfile: { displayName: 'Orbit' },
    });

    jotaiStore.set(isCurrentUserLoadedState.atom, false);
    fixture.assistant.resumeSave();
    await waitFor(() =>
      expect(
        jotaiStore.get(currentWorkspaceState.atom)?.aiChatAssistantProfile
          .displayName,
      ).toBe('Orbit'),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenCalledOnce();
    jotaiStore.set(isCurrentUserLoadedState.atom, true);

    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Failed to save assistant settings. Try again.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(fixture.assistant.saveProfile).toHaveBeenCalledTimes(2),
    );
    expect(fixture.assistant.saveProfile).toHaveBeenLastCalledWith({
      aiChatAssistantProfile: { avatarShape: 'cloud' },
    });
    await waitFor(() =>
      expect(
        jotaiStore.get(currentWorkspaceState.atom)?.aiChatAssistantProfile
          .avatarShape,
      ).toBe('cloud'),
    );
    expect(fixture.assistant.resetProfile).not.toHaveBeenCalled();
    expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
  },
};
