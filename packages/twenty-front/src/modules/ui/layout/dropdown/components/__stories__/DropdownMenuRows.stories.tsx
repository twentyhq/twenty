import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';

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
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    DROPDOWN_ID,
  );

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
          selectableItemIdArray={
            isSubmenuOpen
              ? ['disabled', 'destination']
              : [
                  WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.changeNode,
                  WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS.duplicateNode,
                ]
          }
        >
          {isSubmenuOpen ? (
            <>
              <NavigationMenuItemSelectableItem
                item={{
                  id: 'disabled',
                  label: 'Unavailable destination',
                  isDisabled: true,
                  onClick: () => onAction('disabled'),
                }}
              />
              <NavigationMenuItemSelectableItem
                item={{
                  id: 'destination',
                  label: 'Choose destination',
                  onClick: () => {
                    onAction('destination');
                    closeDropdown(DROPDOWN_ID);
                  },
                }}
              />
            </>
          ) : (
            <WorkflowStepOptionsMenuItems
              selectedItemId={selectedItemId}
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
    await userEvent.keyboard('{Enter}');

    expect(args.onAction).not.toHaveBeenCalled();
    expect(canvas.getByText('Choose destination')).toBeVisible();

    await userEvent.keyboard('{ArrowDown}{Enter}');

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
