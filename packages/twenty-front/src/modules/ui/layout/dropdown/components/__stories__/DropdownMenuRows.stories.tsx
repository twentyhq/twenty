import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { Dropdown } from 'twenty-ui/components';
import { IconCopyPlus, IconPencil } from 'twenty-ui/icon';

type DropdownMenuRowsProps = {
  onAction: (action: string) => void;
  onParentClick: () => void;
};

const DropdownMenuRows = ({
  onAction,
  onParentClick,
}: DropdownMenuRowsProps) => {
  return (
    <>
      <div onClick={onParentClick}>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger render={<Button>Open actions</Button>} />
          <Dropdown.Content side="top" align="end" sideOffset={8}>
            <Dropdown.Page id="root">
              <Dropdown.Section>
                <Dropdown.ActionItem
                  page="destinations"
                  startIcon={<IconPencil />}
                >
                  Change node
                </Dropdown.ActionItem>
                <Dropdown.ActionItem
                  startIcon={<IconCopyPlus />}
                  onClick={() => onAction('duplicate')}
                >
                  Duplicate node
                </Dropdown.ActionItem>
              </Dropdown.Section>
            </Dropdown.Page>
            <Dropdown.Page id="destinations">
              <Dropdown.Section>
                <Dropdown.ActionItem
                  disabled
                  onClick={() => onAction('disabled')}
                >
                  Unavailable destination
                </Dropdown.ActionItem>
                <Dropdown.ActionItem onClick={() => onAction('destination')}>
                  Choose destination
                </Dropdown.ActionItem>
              </Dropdown.Section>
            </Dropdown.Page>
          </Dropdown.Content>
        </Dropdown.Root>
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

    await userEvent.click(canvas.getByText('Open actions'));
    await canvas.findByText('Change node');
    await userEvent.keyboard('{ArrowDown}{Enter}');

    expect(args.onAction).toHaveBeenCalledTimes(1);
    expect(args.onAction).toHaveBeenCalledWith('duplicate');
    expect(canvas.queryByText('Duplicate node')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByText('Open actions'));
    await canvas.findByText('Change node');
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
