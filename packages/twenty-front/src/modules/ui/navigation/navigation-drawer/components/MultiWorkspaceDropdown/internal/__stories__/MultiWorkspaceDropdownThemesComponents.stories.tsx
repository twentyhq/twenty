import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MultiWorkspaceDropdownThemesComponents } from '@/ui/navigation/navigation-drawer/components/MultiWorkspaceDropdown/internal/MultiWorkspaceDropdownThemesComponents';
import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const updateWorkspaceMemberSettings = fn();

const ThemeDropdown = ({ onParentClick }: { onParentClick: () => void }) => (
  <div onClick={onParentClick}>
    <Dropdown
      dropdownId="workspace-theme-story"
      clickableComponent={<Button>Choose theme</Button>}
      dropdownComponents={<MultiWorkspaceDropdownThemesComponents />}
    />
  </div>
);

const meta: Meta<typeof ThemeDropdown> = {
  title: 'UI/Navigation/NavigationDrawer/MultiWorkspaceDropdown/Themes',
  component: ThemeDropdown,
  decorators: [ComponentDecorator, ToastDecorator],
  args: {
    onParentClick: fn(),
  },
  beforeEach: () => {
    updateWorkspaceMemberSettings.mockClear();
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      ...mockedWorkspaceMemberData,
      colorScheme: 'Dark',
    });
    jotaiStore.set(persistedColorSchemeState.atom, 'Dark');
  },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation('UpdateWorkspaceMemberSettings', ({ variables }) => {
          updateWorkspaceMemberSettings(variables.input);

          return HttpResponse.json({
            data: { updateWorkspaceMemberSettings: true },
          });
        }),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeDropdown>;

export const SelectThemeWithoutClosing: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('Choose theme'));

    expect(
      await canvas.findByRole('option', { name: 'Dark', selected: true }),
    ).toBeVisible();
    expect(
      canvas.getByRole('option', { name: 'Light', selected: false }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('option', { name: 'Light' }));

    await waitFor(() => {
      expect(updateWorkspaceMemberSettings).toHaveBeenCalledTimes(1);
      expect(updateWorkspaceMemberSettings).toHaveBeenCalledWith({
        workspaceMemberId: mockedWorkspaceMemberData.id,
        update: { colorScheme: 'Light' },
      });
    });
    expect(args.onParentClick).not.toHaveBeenCalled();
    expect(
      canvas.getByRole('option', { name: 'Light', selected: true }),
    ).toBeVisible();
    expect(
      canvas.getByRole('option', { name: 'Dark', selected: false }),
    ).toBeVisible();
  },
};
