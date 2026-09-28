import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const onModifierShortcut = fn();

const ModifierShortcutListener = () => {
  useGlobalHotkeys({
    keys: ['ctrl+k'],
    callback: onModifierShortcut,
    containsModifier: true,
  });

  return null;
};

const meta: Meta<typeof DropdownRoot> = {
  title: 'UI/Layout/Dropdown/DropdownRoot',
  component: DropdownRoot,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'options-dropdown',
    type: 'menu',
    globalHotkeysConfig: { enableGlobalHotkeysWithModifiers: true },
  },
  beforeEach: () => {
    onModifierShortcut.mockClear();
  },
  render: (args) => (
    <>
      <ModifierShortcutListener />
      <DropdownRoot {...args}>
        <Dropdown.Trigger render={<Button>Options</Button>} />
        <Dropdown.Content>
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </DropdownRoot>
    </>
  ),
};

export default meta;
type Story = StoryObj<typeof DropdownRoot>;

export const PreservesModifierShortcuts: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    const duplicateAction = await canvas.findByRole('menuitem', {
      name: 'Duplicate',
    });
    await waitFor(() => expect(duplicateAction).toHaveFocus());

    await userEvent.keyboard('{Control>}k{/Control}');

    await expect(onModifierShortcut).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
  },
};
