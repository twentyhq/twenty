import styled from '@emotion/styled';
import { Decorator, Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { PlayFunction } from '@storybook/types';
import { useState } from 'react';
import {
  Avatar,
  Button,
  ComponentDecorator,
  MenuItem,
  MenuItemMultiSelectAvatar,
  MenuItemSelectAvatar,
} from 'twenty-ui';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';

import { Dropdown } from '../Dropdown';
import { DropdownMenuHeader } from '../DropdownMenuHeader';
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
    dropdownHotkeyScope: { scope: 'testDropdownMenu' },
    dropdownOffset: { x: 0, y: 8 },
    dropdownId: 'test-dropdown-id',
  },
  argTypes: {
    clickableComponent: { control: false },
    dropdownHotkeyScope: { control: false },
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

    const buttons = await canvas.findAllByRole('button', {
      name: 'Open Dropdown',
    });
    userEvent.click(buttons[0]);

    await waitFor(async () => {
      const fakeMenu = await canvas.findByTestId('dropdown-content');
      expect(fakeMenu).toBeInTheDocument();
    });

    userEvent.click(buttons[0]);

    await waitFor(async () => {
      const fakeMenu = canvas.queryByTestId('dropdown-content');
      expect(fakeMenu).not.toBeInTheDocument();
    });

    userEvent.click(buttons[0]);
    await waitFor(async () => {
      const fakeMenu = await canvas.findByTestId('dropdown-content');
      expect(fakeMenu).toBeInTheDocument();
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
  userEvent.click(buttons[0]);

  await waitFor(async () => {
    expect(canvas.getByText('Company A')).toBeInTheDocument();
  });
};

export const WithHeaders: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    dropdownComponents: (
      <>
        <DropdownMenuHeader>Header</DropdownMenuHeader>
        <DropdownMenuSeparator />
        <StyledDropdownMenuSubheader>Subheader 1</StyledDropdownMenuSubheader>
        <DropdownMenuItemsContainer hasMaxHeight>
          <>
            {optionsMock.slice(0, 3).map(({ name }) => (
              <MenuItem text={name} />
            ))}
          </>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <StyledDropdownMenuSubheader>Subheader 2</StyledDropdownMenuSubheader>
        <DropdownMenuItemsContainer>
          {optionsMock.slice(3).map(({ name }) => (
            <MenuItem text={name} />
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

    await waitFor(() => {
      userEvent.click(buttons[0]);
      expect(canvas.getByDisplayValue('query')).toBeInTheDocument();
    });

    await waitFor(() => {
      userEvent.click(buttons[0]);
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
            <MenuItem text={name} />
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
