import styled from '@emotion/styled';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { PlayFunction } from '@storybook/types';
import { useState } from 'react';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';

import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { internalHotkeysEnabledScopesState } from '@/ui/utilities/hotkey/states/internal/internalHotkeysEnabledScopesState';
import { SetRecoilState } from 'recoil';
import { Avatar, IconChevronLeft } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  MenuItem,
  MenuItemMultiSelectAvatar,
  MenuItemSelectAvatar,
} from 'twenty-ui/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { Dropdown } from '../Dropdown';
import { DropdownMenuHeader } from '../DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuInput } from '../DropdownMenuInput';
import { DropdownMenuItemsContainer } from '../DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '../DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '../DropdownMenuSeparator';
import { StyledDropdownMenuSubheader } from '../StyledDropdownMenuSubheader';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Layout/Dropdown/Dropdown',
  component: Dropdown,
  decorators: [ComponentDecorator, (Story) => <Story />],
  args: {
    clickableComponent: <Button title="Open Dropdown" />,
    dropdownOffset: { x: 0, y: 8 },
    dropdownId: 'test-dropdown-id',
  },
  argTypes: {
    clickableComponent: { control: false },
    dropdownOffset: { control: false },
    dropdownComponents: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const StyledContainer = styled.div`
  height: 600px;
  position: relative;

  width: 300px;
`;

const StyledMenuAbsolutePositionWrapper = styled.div`
  height: fit-content;
  width: fit-content;
`;

const WithContentBelowDecorator: Decorator = (Story) => (
  <StyledContainer>
    <StyledMenuAbsolutePositionWrapper>
      <Story />
    </StyledMenuAbsolutePositionWrapper>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat.
  </StyledContainer>
);

const StyledEmptyDropdownContent = styled.div`
  height: 400px;
  width: 100%;
`;

export const Empty: Story = {
  args: {
    dropdownComponents: (
      <StyledEmptyDropdownContent data-testid="dropdown-content" />
    ),
  },
  play: async () => {
    const canvas = within(document.body);

    const buttons = await canvas.findAllByRole('button');
    await userEvent.click(buttons[0]);

    const fakeMenu = await canvas.findByTestId('dropdown-content');

    await waitFor(() => {
      expect(fakeMenu).toBeInTheDocument();
    });

    await userEvent.click(buttons[0]);

    await waitFor(() => {
      const fakeMenuBis = canvas.queryByTestId('dropdown-content');
      expect(fakeMenuBis).not.toBeInTheDocument();
    });

    await userEvent.click(buttons[0]);
    const fakeMenuTer = await canvas.findByTestId('dropdown-content');

    await waitFor(() => {
      expect(fakeMenuTer).toBeInTheDocument();
    });
  },
};

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/bbb5/4905/f0a52cc2b9aaeb0a82a360d478dae8bf?Expires=1687132800&Signature=iVBr0BADa3LHoFVGbwqO-wxC51n1o~ZyFD-w7nyTyFP4yB-Y6zFawL-igewaFf6PrlumCyMJThDLAAc-s-Cu35SBL8BjzLQ6HymzCXbrblUADMB208PnMAvc1EEUDq8TyryFjRO~GggLBk5yR0EXzZ3zenqnDEGEoQZR~TRqS~uDF-GwQB3eX~VdnuiU2iittWJkajIDmZtpN3yWtl4H630A3opQvBnVHZjXAL5YPkdh87-a-H~6FusWvvfJxfNC2ZzbrARzXofo8dUFtH7zUXGCC~eUk~hIuLbLuz024lFQOjiWq2VKyB7dQQuGFpM-OZQEV8tSfkViP8uzDLTaCg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

const optionsMock = [
  {
    id: '1',
    name: 'Company A',
    avatarUrl,
  },
  {
    id: '2',
    name: 'Company B',
    avatarUrl,
  },
  {
    id: '3',
    name: 'Company C',
    avatarUrl,
  },
  {
    id: '4',
    name: 'Person 2',
    avatarUrl,
  },
  {
    id: '5',
    name: 'Company D',
    avatarUrl,
  },
  {
    id: '6',
    name: 'Person 1',
    avatarUrl,
  },
];

const FakeSelectableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <>
      {optionsMock.map((item) => (
        <MenuItemSelectAvatar
          key={item.id}
          selected={selectedItem === item.id}
          onClick={() => setSelectedItem(item.id)}
          avatar={
            hasAvatar ? (
              <Avatar
                placeholder="A"
                avatarUrl={item.avatarUrl}
                size="md"
                type="squared"
              />
            ) : undefined
          }
          text={item.name}
        />
      ))}
    </>
  );
};

const FakeCheckableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
  const [selectedItemsById, setSelectedItemsById] = useState<
    Record<string, boolean>
  >({});

  return (
    <>
      {optionsMock.map((item) => (
        <MenuItemMultiSelectAvatar
          key={item.id}
          selected={selectedItemsById[item.id]}
          onSelectChange={(checked) =>
            setSelectedItemsById((previous) => ({
              ...previous,
              [item.id]: checked,
            }))
          }
          avatar={
            hasAvatar ? (
              <Avatar
                placeholder="A"
                avatarUrl={item.avatarUrl}
                size="md"
                type="squared"
              />
            ) : undefined
          }
          text={item.name}
        />
      ))}
    </>
  );
};

const playInteraction: PlayFunction<any, any> = async () => {
  const canvas = within(document.body);

  const buttons = await canvas.findAllByRole('button');
  await userEvent.click(buttons[0]);

  await waitFor(() => {
    expect(canvas.getByText('Company A')).toBeInTheDocument();
  });
};

export const WithHeaders: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <>
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent Icon={IconChevronLeft} />
          }
        >
          Header
        </DropdownMenuHeader>
        <StyledDropdownMenuSubheader>Subheader 1</StyledDropdownMenuSubheader>
        <DropdownMenuItemsContainer hasMaxHeight>
          <>
            {optionsMock.slice(0, 3).map((item) => (
              <MenuItem key={item.id} text={item.name} />
            ))}
          </>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <StyledDropdownMenuSubheader>Subheader 2</StyledDropdownMenuSubheader>
        <DropdownMenuItemsContainer>
          {optionsMock.slice(3).map((item) => (
            <MenuItem key={item.id} text={item.name} />
          ))}
        </DropdownMenuItemsContainer>
      </>
    ),
  },
  play: playInteraction,
};

export const SearchWithLoadingMenu: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <>
        <DropdownMenuSearchInput value="query" autoFocus />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          <DropdownMenuSkeletonItem />
        </DropdownMenuItemsContainer>
      </>
    ),
  },
  play: async () => {
    const canvas = within(document.body);

    const buttons = await canvas.findAllByRole('button');

    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(canvas.getByDisplayValue('query')).toBeInTheDocument();
    });

    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(canvas.queryByDisplayValue('query')).not.toBeInTheDocument();
    });
  },
};

export const WithInput: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <>
        <DropdownMenuInput value="Lorem ipsum" autoFocus />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {optionsMock.map(({ name }) => (
            <MenuItem key={name} text={name} />
          ))}
        </DropdownMenuItemsContainer>
      </>
    ),
  },
  play: playInteraction,
};

export const SelectableMenuItemWithAvatar: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList hasAvatar />
      </DropdownMenuItemsContainer>
    ),
  },
  play: playInteraction,
};

export const CheckableMenuItemWithAvatar: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList hasAvatar />
      </DropdownMenuItemsContainer>
    ),
  },
  play: playInteraction,
};

const modalId = 'dropdown-modal-test';

const ModalWithDropdown = () => {
  return (
    <>
      <Modal modalId={modalId} size="medium" padding="medium" isClosable={true}>
        <Modal.Header>Modal with Dropdown Test</Modal.Header>
        <Modal.Content>
          <p>
            This modal contains a dropdown that should appear above the modal
            (higher z-index).
          </p>
          <div style={{ marginTop: '20px' }}>
            <Dropdown
              clickableComponent={
                <Button
                  dataTestId="dropdown-button"
                  title="Open Dropdown in Modal"
                />
              }
              dropdownOffset={{ x: 0, y: 8 }}
              dropdownId="modal-dropdown-test"
              isDropdownInModal={true}
              dropdownComponents={
                <DropdownMenuItemsContainer hasMaxHeight>
                  <div data-testid="dropdown-content">
                    <FakeSelectableMenuItemList hasAvatar />
                  </div>
                </DropdownMenuItemsContainer>
              }
            />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};

const initializeModalState = ({ set }: { set: SetRecoilState }) => {
  set(
    isModalOpenedComponentState.atomFamily({
      instanceId: modalId,
    }),
    true,
  );

  set(currentHotkeyScopeState, {
    scope: ModalHotkeyScope.ModalFocus,
    customScopes: {
      commandMenu: true,
      goto: false,
      keyboardShortcutMenu: false,
    },
  });

  set(internalHotkeysEnabledScopesState, [ModalHotkeyScope.ModalFocus]);

  set(focusStackState, [
    {
      focusId: modalId,
      componentInstance: {
        componentType: FocusComponentType.MODAL,
        componentInstanceId: modalId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: true,
      },
    },
  ]);
};

export const DropdownInsideModal: Story = {
  decorators: [I18nFrontDecorator, RootDecorator, ComponentDecorator],
  parameters: {
    initializeState: initializeModalState,
    disableHotkeyInitialization: true,
  },
  render: () => <ModalWithDropdown />,
  play: async () => {
    const canvas = within(document.body);

    const dropdownButton = await canvas.findByTestId('dropdown-button');

    await userEvent.click(dropdownButton);

    const dropdownContent = await canvas.findByTestId('dropdown-content');

    expect(dropdownContent).toBeVisible();
  },
};
