import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof CommandMenuItemEditButton> = {
  title: 'Modules/CommandMenu/CommandMenuItemEditButton',
  component: CommandMenuItemEditButton,
  decorators: [
    (Story) => {
      jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, true);
      jotaiStore.set(isSidePanelOpenedState.atom, false);
      jotaiStore.set(isSidePanelClosingState.atom, false);
      jotaiStore.set(sidePanelNavigationStackState.atom, []);

      return (
        <JotaiProvider store={jotaiStore}>
          <Story />
        </JotaiProvider>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof CommandMenuItemEditButton>;

export const Default: Story = {};

export const KeyboardToggle: Story = {
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', {
      name: 'Edit actions',
    });

    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    button.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(button).toHaveAttribute('aria-expanded', 'true'),
    );
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(button).toHaveAttribute('aria-expanded', 'false'),
    );
    await userEvent.tab();
  },
};

export const LayoutCustomizationDisabled: Story = {
  decorators: [
    (Story) => {
      jotaiStore.set(isLayoutCustomizationModeEnabledState.atom, false);

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).findByRole('button', { name: 'Edit actions' }),
    ).rejects.toThrow();
  },
};
