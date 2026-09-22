import { Menu } from 'twenty-ui/primitives/surfaces';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';

const DROPDOWN_ID = 'dropdown-menu-rows-story';

type DropdownMenuRowsProps = {
  onAction: (action: string) => void;
  onParentClick: () => void;
};

const DropdownMenuRows = ({
  onAction,
  onParentClick,
}: DropdownMenuRowsProps) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const { closeDropdown } = useCloseDropdown();

  const handleDuplicate = () => {
    onAction('duplicate');
    closeDropdown(DROPDOWN_ID);
  };

  return (
    <>
      <div onClick={onParentClick}>
        <OptionsDropdownMenu
          dropdownId={DROPDOWN_ID}
          shouldRegisterOptionsHotkey={false}
          clickableComponent={<Button>Open actions</Button>}
          onOpen={() => setIsSubmenuOpen(false)}
        >
          {isSubmenuOpen ? (
            <>
              <Menu.Item disabled onClick={() => onAction('disabled')}>
                Unavailable destination
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  onAction('destination');
                  closeDropdown(DROPDOWN_ID);
                }}
              >
                Choose destination
              </Menu.Item>
            </>
          ) : (
            <WorkflowStepOptionsMenuItems
              changeNodeText="Change node"
              onChangeNode={() => setIsSubmenuOpen(true)}
              onDuplicateNode={handleDuplicate}
            />
          )}
        </OptionsDropdownMenu>
      </div>
      <Button>Outside</Button>
    </>
  );
};

const meta: Meta<typeof DropdownMenuRows> = {
  title: 'UI/Layout/Dropdown/DropdownMenuRows',
  component: DropdownMenuRows,
  decorators: [ComponentDecorator],
  args: {
    onAction: fn(),
    onParentClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenuRows>;

export const ClickAction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('Open actions'));
    await userEvent.click(await canvas.findByText('Duplicate node'));

    expect(args.onAction).toHaveBeenCalledTimes(1);
    expect(args.onAction).toHaveBeenCalledWith('duplicate');
    expect(args.onParentClick).not.toHaveBeenCalled();
    expect(canvas.queryByText('Duplicate node')).not.toBeInTheDocument();
  },
};

export const KeyboardNavigationAndReopening: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    canvas.getByRole('button', { name: 'Open actions' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await canvas.findByRole('menuitem', { name: 'Change node' });
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(args.onAction).toHaveBeenCalledTimes(1);
    expect(args.onAction).toHaveBeenCalledWith('duplicate');
    expect(canvas.queryByText('Duplicate node')).not.toBeInTheDocument();

    canvas.getByRole('button', { name: 'Open actions' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await canvas.findByRole('menuitem', { name: 'Change node' });
    await userEvent.keyboard('{Enter}');

    expect(await canvas.findByText('Choose destination')).toBeVisible();
    expect(args.onAction).toHaveBeenCalledTimes(1);
  },
};

export const SubmenuAndDisabledActions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('Open actions'));
    await userEvent.click(await canvas.findByText('Change node'));
    await userEvent.click(await canvas.findByText('Unavailable destination'));

    expect(args.onAction).not.toHaveBeenCalled();
    expect(canvas.getByText('Choose destination')).toBeVisible();

    canvas.getByRole('menuitem', { name: 'Choose destination' }).focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onAction).toHaveBeenCalledTimes(1);
    expect(args.onAction).toHaveBeenCalledWith('destination');
    expect(canvas.queryByText('Choose destination')).not.toBeInTheDocument();
  },
};

export const DismissOnEscape: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('Open actions'));
    await canvas.findByText('Change node');
    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(canvas.queryByText('Change node')).not.toBeInTheDocument();
    });
    expect(args.onAction).not.toHaveBeenCalled();
  },
};

export const DismissOnOutsideClick: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByText('Open actions'));
    await canvas.findByText('Change node');
    await userEvent.click(canvas.getByText('Outside'));

    await waitFor(() => {
      expect(canvas.queryByText('Change node')).not.toBeInTheDocument();
    });
    expect(args.onAction).not.toHaveBeenCalled();
  },
};
