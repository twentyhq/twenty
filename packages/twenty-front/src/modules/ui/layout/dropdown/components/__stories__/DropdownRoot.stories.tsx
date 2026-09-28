import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { StrictMode, useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

const onModifierShortcut = fn();
const onOpenChange = fn();

const ModifierShortcutListener = () => {
  useGlobalHotkeys({
    keys: ['ctrl+k'],
    callback: onModifierShortcut,
    containsModifier: true,
  });

  return null;
};

const OpenFromShortcutButton = ({ dropdownId }: { dropdownId: string }) => {
  const { openDropdown } = useOpenDropdown();

  return (
    <Button
      onClick={() =>
        openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId })
      }
    >
      Open from shortcut
    </Button>
  );
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

const meta: Meta<typeof DropdownRoot> = {
  title: 'UI/Layout/Dropdown/DropdownRoot',
  component: DropdownRoot,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'options-dropdown',
    type: 'menu',
    globalHotkeysConfig: { enableGlobalHotkeysWithModifiers: true },
    onOpenChange,
  },
  beforeEach: () => {
    onModifierShortcut.mockClear();
    onOpenChange.mockClear();
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
      <OpenFromShortcutButton dropdownId={args.dropdownId} />
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

export const ReportsWhyItOpensAndCloses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Options' });

    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    );

    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Duplicate' }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'list-navigation' }),
    );

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open from shortcut' }),
    );
    expect(await body.findByRole('menu', { name: 'Options' })).toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'imperative-action' }),
    );
    expect(onOpenChange).toHaveBeenCalledTimes(5);
  },
};

export const CanceledDismissalKeepsItOpen: Story = {
  args: {
    type: 'panel',
    onOpenChange: (open, eventDetails) => {
      onOpenChange(open, eventDetails);

      if (
        !open &&
        (eventDetails.reason === 'outside-press' ||
          eventDetails.reason === 'focus-out')
      ) {
        eventDetails.cancel();
      }
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    const panel = await body.findByRole('dialog', { name: 'Options' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open from shortcut' }),
    );

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

export const OpenedBeforeMountUnderStrictMode: Story = {
  beforeEach: () => {
    jotaiStore.set(
      isDropdownOpenComponentState.atomFamily({
        instanceId: 'group-rename-dropdown',
      }),
      true,
    );
  },
  render: () => (
    <StrictMode>
      <GroupRenamePanel />
    </StrictMode>
  ),
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
