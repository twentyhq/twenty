import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof DropdownRoot> = {
  title: 'UI/Layout/Dropdown/DropdownRoot',
  component: DropdownRoot,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'options-dropdown',
    type: 'menu',
    globalHotkeysConfig: { enableGlobalHotkeysWithModifiers: true },
  },
  render: (args) => (
    <DropdownRoot {...args}>
      <Dropdown.Trigger render={<Button>Options</Button>} />
      <Dropdown.Content>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </Dropdown.Content>
    </DropdownRoot>
  ),
};

export default meta;
type Story = StoryObj<typeof DropdownRoot>;

export const PreservesModifierShortcuts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    await expect(
      await canvas.findByRole('menuitem', { name: 'Duplicate' }),
    ).toBeVisible();
    await expect(
      jotaiStore.get(currentGlobalHotkeysConfigSelector.atom),
    ).toEqual({
      enableGlobalHotkeysConflictingWithKeyboard: false,
      enableGlobalHotkeysWithModifiers: true,
    });
    await userEvent.keyboard('{Escape}');
  },
};
