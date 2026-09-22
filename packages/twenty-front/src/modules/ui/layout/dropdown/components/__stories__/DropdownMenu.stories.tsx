import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { LightIconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { Button, Input } from 'twenty-ui/primitives/input';
import { Menu } from 'twenty-ui/primitives/surfaces';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const DROPDOWN_ID = 'dropdown-menu-integration';

const meta = {
  title: 'UI/Layout/Dropdown/DropdownMenu',
  component: DropdownMenu,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: DROPDOWN_ID,
    clickableComponent: (
      <LightIconButton aria-label="Actions">
        <IconDotsVertical />
      </LightIconButton>
    ),
    dropdownComponents: <Menu.Item>Duplicate</Menu.Item>,
    onOpen: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FocusAndTypeahead: Story = {
  args: {
    dropdownComponents: (
      <Menu.Group>
        <Menu.Item>Archive</Menu.Item>
        <Menu.Item disabled>Delete</Menu.Item>
        <Menu.Item>Rename</Menu.Item>
      </Menu.Group>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(canvas.getByRole('menuitem', { name: 'Archive' })).toHaveFocus(),
    );
    await userEvent.keyboard('r');
    await waitFor(() =>
      expect(canvas.getByRole('menuitem', { name: 'Rename' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(args.onOpen).toHaveBeenCalledTimes(1);
    expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const DisabledTrigger: Story = {
  args: {
    clickableComponent: (
      <LightIconButton disabled aria-label="Actions">
        <IconDotsVertical />
      </LightIconButton>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    expect(args.onOpen).not.toHaveBeenCalled();
  },
};

export const StayOpenAndExternalClose: Story = {
  render: (args) => {
    const [count, setCount] = useState(0);
    const { closeDropdown } = useCloseDropdown();
    return (
      <DropdownMenu
        {...args}
        dropdownComponents={
          <>
            <Menu.Item closeOnClick={false} onClick={() => setCount(count + 1)}>
              Move right {count}
            </Menu.Item>
            <Menu.Item
              closeOnClick={false}
              onClick={() => closeDropdown(DROPDOWN_ID)}
            >
              Finish
            </Menu.Item>
          </>
        }
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Move right 0' }),
    );
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'Move right 1' }),
    );
    expect(
      canvas.getByRole('menuitem', { name: 'Move right 2' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('menuitem', { name: 'Finish' }));
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const ExternalOpenAtPosition: Story = {
  render: (args) => {
    const { openDropdown } = useOpenDropdown();
    return (
      <>
        <Button
          onClick={() =>
            openDropdown({ dropdownComponentInstanceIdFromProps: DROPDOWN_ID })
          }
        >
          Open at position
        </Button>
        <DropdownMenu
          {...args}
          clickableComponent={undefined}
          dropdownPlacement="bottom-start"
          dropdownOffset={{ x: 240, y: 120 }}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open at position' }),
    );
    const menu = await canvas.findByRole('menu');
    await waitFor(() => {
      expect(menu.getBoundingClientRect().left).toBeCloseTo(240, 0);
      expect(menu.getBoundingClientRect().top).toBeCloseTo(120, 0);
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const ClickAfterPointerRelease: Story = {
  args: {
    nativeButton: false,
    openOnClick: true,
    clickableComponent: <div>Column title</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Column title' });
    const user = userEvent.setup();
    await user.pointer({ target: trigger, keys: '[MouseLeft>]' });
    expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
    await user.pointer({ target: trigger, keys: '[/MouseLeft]' });
    expect(
      await canvas.findByRole('menuitem', { name: 'Duplicate' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    expect(
      await canvas.findByRole('menuitem', { name: 'Duplicate' }),
    ).toHaveFocus();
  },
};

export const InsideLegacyDropdown: Story = {
  render: (args) => (
    <Dropdown
      dropdownId="parent-dropdown-menu-integration"
      clickableComponent={<Button>Open picker</Button>}
      dropdownComponents={
        <div>
          <Button>Picker control</Button>
          <DropdownMenu {...args} />
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByText('Open picker'));
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Actions' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Duplicate' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      canvas.getByRole('button', { name: 'Picker control' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await canvas.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      canvas.getByRole('button', { name: 'Picker control' }),
    ).toBeVisible();
  },
};

export const FocusAfterEditAction: Story = {
  render: (args) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <>
        <Input ref={inputRef} aria-label="Name" />
        <DropdownMenu
          {...args}
          finalFocus={inputRef}
          dropdownComponents={<Menu.Item>Rename</Menu.Item>}
        />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Rename' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Name' })).toHaveFocus(),
    );
  },
};

export const LinkAction: Story = {
  decorators: [RouterDecorator],
  render: (args) => {
    const location = useLocation();
    return (
      <>
        <DropdownMenu
          {...args}
          dropdownComponents={
            <Menu.Item render={<Link to="/menu-destination" />}>
              Edit permissions
            </Menu.Item>
          }
        />
        <span>{location.pathname}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const item = await canvas.findByRole('menuitem', {
      name: 'Edit permissions',
    });
    expect(item).toHaveAttribute('href', '/menu-destination');
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(await canvas.findByText('/menu-destination')).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};
