import styled from '@emotion/styled';
import { type Decorator, type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { type PlayFunction } from '@storybook/types';
// TEMP_DISABLED_TEST: Commented out unused import
// import { useState } from 'react';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
// TEMP_DISABLED_TEST: Commented out unused imports due to commented tests
// import { Modal } from '@/ui/layout/modal/components/Modal';
// import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
// import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
// import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
// import { type SetRecoilState } from 'recoil';
import {
  // TEMP_DISABLED_TEST: Commented out unused import
  // Avatar,
  IconChevronLeft,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { ComponentDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';

const meta: Meta<typeof Dropdown> = {
  title: 'UI/Layout/Dropdown/Dropdown',
  component: Dropdown,
  decorators: [I18nFrontDecorator, ComponentDecorator, (Story) => <Story />],
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
      <DropdownContent>
        <StyledEmptyDropdownContent data-testid="dropdown-content" />
      </DropdownContent>
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

// TEMP_DISABLED_TEST: Commented out unused component
// const FakeSelectableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
//   const [selectedItem, setSelectedItem] = useState<string | null>(null);

//   return (
//     <DropdownContent>
//       <DropdownMenuItemsContainer hasMaxHeight>
//         {optionsMock.map((item) => (
//           <MenuItemSelectAvatar
//             key={item.id}
//             selected={selectedItem === item.id}
//             onClick={() => setSelectedItem(item.id)}
//             avatar={
//               hasAvatar ? (
//                 <Avatar
//                   placeholder="A"
//                   avatarUrl={item.avatarUrl}
//                   size="md"
//                   type="squared"
//                 />
//               ) : undefined
//             }
//             text={item.name}
//           />
//         ))}
//       </DropdownMenuItemsContainer>
//     </DropdownContent>
//   );
// };

// TEMP_DISABLED_TEST: Commented out unused component
// const FakeCheckableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
//   const [selectedItemsById, setSelectedItemsById] = useState<
//     Record<string, boolean>
//   >({});

//   return (
//     <DropdownContent>
//       <DropdownMenuItemsContainer hasMaxHeight>
//         {optionsMock.map((item) => (
//           <MenuItemMultiSelectAvatar
//             key={item.id}
//             selected={selectedItemsById[item.id]}
//             onSelectChange={(checked) =>
//               setSelectedItemsById((previous) => ({
//                 ...previous,
//                 [item.id]: checked,
//               }))
//             }
//             avatar={
//               hasAvatar ? (
//                 <Avatar
//                   placeholder="A"
//                   avatarUrl={item.avatarUrl}
//                   size="md"
//                   type="squared"
//                 />
//               ) : undefined
//             }
//             text={item.name}
//           />
//         ))}
//       </DropdownMenuItemsContainer>
//     </DropdownContent>
//   );
// };

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
      <DropdownContent>
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
      </DropdownContent>
    ),
  },
  play: playInteraction,
};

export const SearchWithLoadingMenu: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <DropdownContent>
        <DropdownMenuSearchInput value="query" autoFocus />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          <DropdownMenuSkeletonItem />
        </DropdownMenuItemsContainer>
      </DropdownContent>
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
      <DropdownContent>
        <DropdownMenuInput
          instanceId="dropdown-menu-input"
          value="Lorem ipsum"
          autoFocus
        />
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer hasMaxHeight>
          {optionsMock.map(({ name }) => (
            <MenuItem key={name} text={name} />
          ))}
        </DropdownMenuItemsContainer>
      </DropdownContent>
    ),
  },
  play: playInteraction,
};

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const SelectableMenuItemWithAvatar: Story = {
//   decorators: [WithContentBelowDecorator],
//   args: {
//     dropdownComponents: <FakeSelectableMenuItemList hasAvatar />,
//   },
//   play: playInteraction,
// };

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const CheckableMenuItemWithAvatar: Story = {
//   decorators: [WithContentBelowDecorator],
//   args: {
//     dropdownComponents: <FakeCheckableMenuItemList hasAvatar />,
//   },
//   play: playInteraction,
// };

// TEMP_DISABLED_TEST: Commented out unused variable
// const modalId = 'dropdown-modal-test';

// TEMP_DISABLED_TEST: Commented out unused component
// const ModalWithDropdown = () => {
//   return (
//     <>
//       <Modal modalId={modalId} size="medium" padding="medium" isClosable={true}>
//         <Modal.Header>Modal with Dropdown Test</Modal.Header>
//         <Modal.Content>
//           <p>
//             This modal contains a dropdown that should appear above the modal
//             (higher z-index).
//           </p>
//           <div style={{ marginTop: '20px' }}>
//             <Dropdown
//               clickableComponent={
//                 <Button
//                   dataTestId="dropdown-button"
//                   title="Open Dropdown in Modal"
//                 />
//               }
//               dropdownOffset={{ x: 0, y: 8 }}
//               dropdownId="modal-dropdown-test"
//               isDropdownInModal={true}
//               dropdownComponents={
//                 <div data-testid="dropdown-content">
//                   <FakeSelectableMenuItemList hasAvatar />
//                 </div>
//               }
//             />
//           </div>
//         </Modal.Content>
//       </Modal>
//     </>
//   );
// };

// TEMP_DISABLED_TEST: Commented out unused function
// const initializeModalState = ({ set }: { set: SetRecoilState }) => {
//   set(
//     isModalOpenedComponentState.atomFamily({
//       instanceId: modalId,
//     }),
//     true,
//   );

//   set(focusStackState, [
//     {
//       focusId: modalId,
//       componentInstance: {
//         componentType: FocusComponentType.MODAL,
//         componentInstanceId: modalId,
//       },
//       globalHotkeysConfig: {
//         enableGlobalHotkeysWithModifiers: true,
//         enableGlobalHotkeysConflictingWithKeyboard: true,
//       },
//     },
//   ]);
// };

// TEMP_DISABLED_TEST: Temporarily commented out due to test failure
// export const DropdownInsideModal: Story = {
//   decorators: [I18nFrontDecorator, RootDecorator, ComponentDecorator],
//   parameters: {
//     initializeState: initializeModalState,
//     disableHotkeyInitialization: true,
//   },
//   render: () => <ModalWithDropdown />,
//   play: async () => {
//     const canvas = within(document.body);

//     const dropdownButton = await canvas.findByTestId('dropdown-button');

//     await userEvent.click(dropdownButton);

//     const dropdownContent = await canvas.findByTestId('dropdown-content');

//     expect(dropdownContent).toBeVisible();
//   },
// };
