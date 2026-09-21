import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { OptionsDropdownMenu } from '@/ui/layout/dropdown/components/OptionsDropdownMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { WORKFLOW_STEP_OPTIONS_MENU_ITEM_IDS } from '@/workflow/workflow-steps/constants/WorkflowStepOptionsMenuItemIds';

const DROPDOWN_ID = 'dropdown-menu-rows-test';

const DropdownMenuRows = ({
  onAction,
}: {
  onAction: (action: string) => void;
}) => {
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
  );
};

const renderMenu = () => {
  const onAction = jest.fn();
  const onParentClick = jest.fn();

  render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <div onClick={onParentClick}>
          <DropdownMenuRows onAction={onAction} />
        </div>
        <Button>Outside</Button>
      </I18nProvider>
    </Provider>,
  );

  return { user: userEvent.setup(), onAction, onParentClick };
};

describe('migrated dropdown menu rows', () => {
  it('activates an action once and dismisses without activating its parent', async () => {
    const { user, onAction, onParentClick } = renderMenu();

    await user.click(screen.getByText('Open actions'));
    await user.click(await screen.findByText('Duplicate node'));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('duplicate');
    expect(onParentClick).not.toHaveBeenCalled();
    expect(screen.queryByText('Duplicate node')).not.toBeInTheDocument();
  });

  it('retains arrow navigation, Enter activation, and selection after reopening', async () => {
    const { user, onAction } = renderMenu();

    await user.click(screen.getByText('Open actions'));
    await screen.findByText('Change node');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('duplicate');
    expect(screen.queryByText('Duplicate node')).not.toBeInTheDocument();

    await user.click(screen.getByText('Open actions'));
    await screen.findByText('Change node');
    await user.keyboard('{Enter}');

    expect(await screen.findByText('Choose destination')).toBeInTheDocument();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('keeps submenus open and ignores disabled actions for mouse and keyboard', async () => {
    const { user, onAction } = renderMenu();

    await user.click(screen.getByText('Open actions'));
    await user.click(await screen.findByText('Change node'));
    await user.click(await screen.findByText('Unavailable destination'));
    await user.keyboard('{Enter}');

    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText('Choose destination')).toBeInTheDocument();

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith('destination');
    expect(screen.queryByText('Choose destination')).not.toBeInTheDocument();
  });

  it.each(['Escape', 'outside click'])(
    'dismisses on %s without activating a row',
    async (dismissal) => {
      const { user, onAction } = renderMenu();

      await user.click(screen.getByText('Open actions'));
      await screen.findByText('Change node');

      if (dismissal === 'Escape') {
        await user.keyboard('{Escape}');
      }

      if (dismissal === 'outside click') {
        await user.click(screen.getByText('Outside'));
      }

      await waitFor(() => {
        expect(screen.queryByText('Change node')).not.toBeInTheDocument();
      });
      expect(onAction).not.toHaveBeenCalled();
    },
  );
});
