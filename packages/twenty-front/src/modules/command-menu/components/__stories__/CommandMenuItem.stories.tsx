import { CommandMenuItemDropdownTrigger } from '@/command-menu/components/CommandMenuItemDropdownTrigger';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Dropdown } from 'twenty-ui/components/navigation';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const onTrailingAction = fn();
const onFirstCommand = fn();
const onDisabledCommand = fn();
const onLastCommand = fn();
const FOCUS_ID = 'command-menu-item-story';

const CommandMenuItemStoryFocusEffect = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId: FOCUS_ID,
      component: { type: FocusComponentType.DROPDOWN, instanceId: FOCUS_ID },
    });

    return () => removeFocusItemFromFocusStackById({ focusId: FOCUS_ID });
  }, [pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  return null;
};

const meta: Meta<typeof CommandMenuItem> = {
  title: 'Modules/CommandMenu/CommandMenuItem',
  component: CommandMenuItem,
  decorators: [
    (Story) => (
      <SelectableList
        selectableListInstanceId="command-menu-item-story"
        selectableItemIdArray={['command']}
        focusId="command-menu-item-story"
      >
        <CommandMenuItemStoryFocusEffect />
        <Story />
      </SelectableList>
    ),
    MemoryRouterDecorator,
    ComponentDecorator,
  ],
  args: {
    id: 'command',
    label: 'Run command',
    Icon: IconPlus,
    hotKeys: ['G', 'C'],
    onClick: fn(),
  },
  beforeEach: () => {
    onTrailingAction.mockClear();
    onFirstCommand.mockClear();
    onDisabledCommand.mockClear();
    onLastCommand.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenuItem>;

export const NativeAction: Story = {
  play: async ({ canvasElement, args }) => {
    const action = await within(canvasElement).findByRole('button', {
      name: /Run command/,
    });

    await userEvent.click(action);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(args.onClick).toHaveBeenCalledTimes(3);
    expect(action).toHaveFocus();
  },
};

export const IndependentTrailingAction: Story = {
  args: {
    RightComponent: <Button onClick={onTrailingAction}>Configure</Button>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const configure = await canvas.findByRole('button', { name: 'Configure' });

    expect(configure.parentElement?.closest('button')).toBeNull();

    await userEvent.click(configure);

    expect(onTrailingAction).toHaveBeenCalledTimes(1);
    expect(args.onClick).not.toHaveBeenCalled();

    const action = canvas.getByRole('button', { name: /Run command/ });

    action.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onClick).toHaveBeenCalledTimes(1);
    expect(onTrailingAction).toHaveBeenCalledTimes(1);
  },
};

export const DisabledAction: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const action = await within(canvasElement).findByRole('button', {
      name: /Run command/,
    });

    expect(action).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(action);

    expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const MixedNativeCommandOwners: Story = {
  render: () => (
    <SelectableList
      selectableListInstanceId="mixed-command-owners"
      selectableItemIdArray={['first', 'dropdown', 'disabled', 'last']}
      focusId={FOCUS_ID}
    >
      <CommandMenuItem
        id="first"
        label="First command"
        onClick={onFirstCommand}
      />
      <DropdownRoot dropdownId="command-menu-item-destination" type="menu">
        <CommandMenuItemDropdownTrigger
          id="dropdown"
          label="Choose destination"
        />
        <DropdownContent>
          <Dropdown.ActionItem>Available destinations</Dropdown.ActionItem>
        </DropdownContent>
      </DropdownRoot>
      <CommandMenuItem
        id="disabled"
        label="Unavailable command"
        disabled
        onClick={onDisabledCommand}
      />
      <CommandMenuItem id="last" label="Last command" onClick={onLastCommand} />
    </SelectableList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const firstCommand = await canvas.findByRole('button', {
      name: 'First command',
    });

    await userEvent.click(firstCommand);
    await userEvent.keyboard('{ArrowDown}');

    const destination = canvas.getByRole('button', {
      name: 'Choose destination',
    });

    expect(destination.parentElement?.closest('[role="button"]')).toBeNull();
    expect(destination).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    const menu = await body.findByRole('menu', {
      name: 'Choose destination',
    });

    expect(menu).toBeVisible();
    expect(destination).toHaveAttribute('aria-controls', menu.id);
    expect(onFirstCommand).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(destination).toHaveFocus());

    const disabledCommand = canvas.getByRole('button', {
      name: 'Unavailable command',
    });

    disabledCommand.focus();

    await userEvent.keyboard('{Enter}');

    expect(onDisabledCommand).not.toHaveBeenCalled();
    expect(onFirstCommand).toHaveBeenCalledTimes(1);

    const lastCommand = canvas.getByRole('button', { name: 'Last command' });

    lastCommand.focus();
    await userEvent.keyboard('{ArrowUp}');

    expect(
      canvas.getByRole('button', { name: 'Unavailable command' }),
    ).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(lastCommand).toHaveFocus();
    expect(onLastCommand).toHaveBeenCalledTimes(1);
  },
};
