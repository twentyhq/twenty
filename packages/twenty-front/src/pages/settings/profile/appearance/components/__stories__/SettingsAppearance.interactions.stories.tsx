import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';
import appearanceMeta from './SettingsAppearance.stories';

const savePreference = fn();

const meta: Meta<typeof SettingsAppearance> = {
  ...appearanceMeta,
  beforeEach: async (context) => {
    await appearanceMeta.beforeEach?.(context);
    savePreference.mockClear();
  },
  title: 'Pages/Settings/Appearance/Interactions',
  parameters: {
    ...appearanceMeta.parameters,
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspaceMemberSettings', ({ variables }) => {
          savePreference(variables.input);
          return HttpResponse.json({
            data: { updateWorkspaceMemberSettings: true },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsAppearance>;

export const SelectionAndKeyboard: Story = {
  render: () => (
    <>
      <SettingsAppearance />
      <Button>Next setting</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = within(
      canvas.getByRole('radiogroup', { name: 'Appearance' }),
    );
    const light = group.getByRole('radio', { name: 'Light' });
    const dark = group.getByRole('radio', { name: 'Dark' });
    const system = group.getByRole('radio', { name: 'System settings' });

    expect(group.getAllByRole('radio')).toHaveLength(3);
    expect(light).toBeChecked();
    await userEvent.click(group.getByText('Dark'));
    await waitFor(() => expect(dark).toBeChecked());
    expect(light).not.toBeChecked();
    expect(jotaiStore.get(persistedColorSchemeState.atom)).toBe('Dark');
    await waitFor(() =>
      expect(savePreference).toHaveBeenLastCalledWith({
        workspaceMemberId: 'appearance-member',
        update: { colorScheme: 'Dark' },
      }),
    );

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(system).toBeChecked());
    expect(system).toHaveFocus();
    expect(dark).not.toBeChecked();
    await waitFor(() =>
      expect(savePreference).toHaveBeenLastCalledWith({
        workspaceMemberId: 'appearance-member',
        update: { colorScheme: 'System' },
      }),
    );

    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Next setting' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(system).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(light).toBeChecked());
    expect(system).not.toBeChecked();
  },
};

export const UnavailableMember: Story = {
  parameters: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const label of ['Light', 'Dark', 'System settings']) {
      const radio = canvas.getByRole('radio', { name: label });

      expect(radio).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(radio);
      await userEvent.click(canvas.getByText(label));
    }
    expect(savePreference).not.toHaveBeenCalled();
    expect(jotaiStore.get(persistedColorSchemeState.atom)).toBe('Light');
  },
};

export const FailedSave: Story = {
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspaceMemberSettings', ({ variables }) => {
          savePreference(variables.input);
          return HttpResponse.json({
            errors: [
              {
                message: 'Unable to save appearance',
                extensions: {
                  userFriendlyMessage: 'Unable to save appearance',
                },
              },
            ],
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Dark' }));
    await waitFor(() =>
      expect(savePreference).toHaveBeenLastCalledWith({
        workspaceMemberId: 'appearance-member',
        update: { colorScheme: 'Dark' },
      }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Light' })).toBeChecked(),
    );
    expect(jotaiStore.get(currentWorkspaceMemberState.atom)?.colorScheme).toBe(
      'Light',
    );
    expect(jotaiStore.get(persistedColorSchemeState.atom)).toBe('Light');
  },
};

export const RightToLeftKeyboard: Story = {
  parameters: { direction: 'rtl' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Light' }));
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Dark' })).toBeChecked(),
    );
  },
};

export const HorizontalLayout: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lateRadioGroupStyles =
      canvasElement.ownerDocument.createElement('style');

    lateRadioGroupStyles.textContent =
      '[role="radiogroup"] { flex-direction: column; }';
    canvasElement.ownerDocument.head.append(lateRadioGroupStyles);

    try {
      const lightBounds = canvas
        .getByRole('radio', { name: 'Light' })
        .getBoundingClientRect();
      const darkBounds = canvas
        .getByRole('radio', { name: 'Dark' })
        .getBoundingClientRect();
      const systemBounds = canvas
        .getByRole('radio', { name: 'System settings' })
        .getBoundingClientRect();

      expect(darkBounds.top).toBe(lightBounds.top);
      expect(systemBounds.top).toBe(lightBounds.top);
      expect(darkBounds.left).toBeGreaterThan(lightBounds.right);
      expect(systemBounds.left).toBeGreaterThan(darkBounds.right);
    } finally {
      lateRadioGroupStyles.remove();
    }
  },
};
