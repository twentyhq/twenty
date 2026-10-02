import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const onModifierShortcut = fn();
const onOutsideClick = fn();

const ModifierShortcutListener = () => {
  useGlobalHotkeys({
    keys: ['ctrl+k'],
    callback: onModifierShortcut,
    containsModifier: true,
  });

  return null;
};

const GroupRenamePanel = () => {
  const groupHeaderRef = useRef<HTMLParagraphElement>(null);

  return (
    <>
      <p ref={groupHeaderRef}>New group</p>
      <DropdownRoot dropdownId="group-rename-dropdown" type="panel">
        <DropdownContent anchor={groupHeaderRef} aria-label="Rename group">
          <input aria-label="Group name" />
        </DropdownContent>
      </DropdownRoot>
    </>
  );
};

const ReplaceableOwnerDropdown = () => {
  const [ownerKey, setOwnerKey] = useState('first-owner');

  return (
    <>
      <DropdownRoot
        key={ownerKey}
        dropdownId="replaced-owner-dropdown"
        type="menu"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <Dropdown.Trigger render={<Button>Actions</Button>} />
        <Dropdown.Content>
          <Dropdown.ActionItem>Archive</Dropdown.ActionItem>
        </Dropdown.Content>
      </DropdownRoot>
      <Button onClick={() => setOwnerKey('second-owner')}>Replace owner</Button>
    </>
  );
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
    onOutsideClick.mockClear();
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
      <Button onClick={onOutsideClick}>Outside</Button>
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

export const PreventedOutsidePressKeepsItOpen: Story = {
  args: {
    type: 'panel',
    onInteractOutside: (event) => event.preventDefault(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    const panel = await body.findByRole('dialog', { name: 'Options' });

    await waitFor(() => expect(panel).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));

    expect(onOutsideClick).toHaveBeenCalledOnce();
    expect(panel).toBeVisible();
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: 'options-dropdown',
        }),
      ),
    ).toBe(true);

    await userEvent.click(body.getByRole('button', { name: 'Duplicate' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const OpenedBeforeMount: Story = {
  beforeEach: () => {
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({
        instanceId: 'group-rename-dropdown',
      }),
      true,
    );
  },
  render: () => <GroupRenamePanel />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Group name' })).toHaveFocus(),
    );
    expect(body.getByRole('dialog', { name: 'Rename group' })).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ReplacedOwnerKeepsItOpen: Story = {
  render: () => <ReplaceableOwnerDropdown />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const isReplacedOwnerDropdownOpen = () =>
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId: 'replaced-owner-dropdown',
        }),
      );

    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await body.findByRole('menu', { name: 'Actions' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace owner' }),
    );

    expect(isReplacedOwnerDropdownOpen()).toBe(true);
    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Actions' })).toBeVisible(),
    );

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(isReplacedOwnerDropdownOpen()).toBe(false));
  },
};
