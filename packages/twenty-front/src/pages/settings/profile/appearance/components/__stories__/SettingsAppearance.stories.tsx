import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { ToastProvider } from 'twenty-ui/components';
import { TextDirectionProvider } from 'twenty-ui/primitives/layout';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme';
import { SettingsAppearance } from '~/pages/settings/profile/appearance/components/SettingsAppearance';

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
  decorators: [
    (Story, { parameters }) => (
      <ThemeProvider
        colorScheme={parameters.colorScheme === 'Dark' ? 'dark' : 'light'}
        applyToRoot={false}
      >
        <TextDirectionProvider direction={parameters.direction ?? 'ltr'}>
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
        </TextDirectionProvider>
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
