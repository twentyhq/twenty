import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { DirectionProvider } from 'twenty-ui/primitives/layout';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

const meta = {
  title: 'Pages/Settings/Appearance',
  component: SettingsAppearance,
  parameters: {
    layout: 'centered',
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspaceMemberSettings', () =>
          HttpResponse.json({ data: { updateWorkspaceMemberSettings: true } }),
        ),
      ],
    },
  },
  beforeEach: ({ parameters }) => {
    const colorScheme: ColorScheme = parameters.colorScheme ?? 'Light';

    jotaiStore.set(
      currentWorkspaceMemberState.atom,
      parameters.disabled
        ? null
        : {
            id: 'appearance-member',
            name: { firstName: 'Alex', lastName: 'Example' },
            userEmail: 'alex@example.com',
            locale: 'en',
            colorScheme,
          },
    );
    jotaiStore.set(persistedColorSchemeState.atom, colorScheme);
  },
  play: async ({ canvasElement, parameters }) => {
    const group = within(
      within(canvasElement).getByRole('radiogroup', { name: 'Appearance' }),
    );
    const isDisabled = parameters.disabled === true;
    const selectedColorScheme = isDisabled
      ? 'System'
      : (parameters.colorScheme ?? 'Light');
    const selectedLabel =
      selectedColorScheme === 'System'
        ? 'System settings'
        : selectedColorScheme;

    for (const label of ['Light', 'Dark', 'System settings']) {
      const radioBounds = group
        .getByRole('radio', { name: label })
        .getBoundingClientRect();
      const labelBounds = group.getByText(label).getBoundingClientRect();

      expect(radioBounds.height).toBe(80);
      expect(labelBounds.top - radioBounds.bottom).toBe(8);
    }

    expect(group.getAllByRole('radio', { checked: true })).toHaveLength(1);
    expect(group.getByRole('radio', { checked: true })).toHaveAccessibleName(
      selectedLabel,
    );

    if (!isDisabled) {
      return;
    }

    for (const radio of group.getAllByRole('radio')) {
      expect(radio).toHaveAttribute('aria-disabled', 'true');
    }
  },
  decorators: [
    (Story, { parameters }) => (
      <ThemeProvider
        colorScheme={parameters.colorScheme === 'Dark' ? 'dark' : 'light'}
        applyToRoot={false}
      >
        <DirectionProvider direction={parameters.direction ?? 'ltr'}>
          <ToastProvider>
            <div
              style={{
                width: 520,
                maxWidth: '100vw',
                background: themeCssVariables.background.primary,
              }}
            >
              <Story />
            </div>
          </ToastProvider>
        </DirectionProvider>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof SettingsAppearance>;

export default meta;
type Story = StoryObj<typeof SettingsAppearance>;

export const Default: Story = {};
export const Dark: Story = { parameters: { colorScheme: 'Dark' } };
export const System: Story = { parameters: { colorScheme: 'System' } };
export const Disabled: Story = { parameters: { disabled: true } };
export const RightToLeft: Story = { parameters: { direction: 'rtl' } };
