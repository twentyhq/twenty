import { useState } from 'react';
import styled from '@emotion/styled';
import type { Decorator, Meta, StoryObj } from '@storybook/react';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/menu-item/components/MenuItemMultiSelectAvatar';
import { MenuItemSelectAvatar } from '@/ui/menu-item/components/MenuItemSelectAvatar';
import { Avatar } from '@/users/components/Avatar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DropdownMenuHeader } from '../DropdownMenuHeader';
import { DropdownMenuInput } from '../DropdownMenuInput';
import { DropdownMenuInputContainer } from '../DropdownMenuInputContainer';
import { DropdownMenuSearchInput } from '../DropdownMenuSearchInput';
import { StyledDropdownMenu } from '../StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '../StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSeparator } from '../StyledDropdownMenuSeparator';
import { StyledDropdownMenuSubheader } from '../StyledDropdownMenuSubheader';

const meta: Meta<typeof StyledDropdownMenu> = {
  title: 'UI/Dropdown/DropdownMenu',
  component: StyledDropdownMenu,
  decorators: [ComponentDecorator],
  argTypes: {
    as: { table: { disable: true } },
    children: { control: false },
    theme: { table: { disable: true } },
    width: { type: 'number', defaultValue: undefined },
  },
};

export default meta;
type Story = StoryObj<typeof StyledDropdownMenu>;

const FakeContentBelow = () => (
  <div style={{ position: 'absolute' }}>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
    consequat.
  </div>
);

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/bbb5/4905/f0a52cc2b9aaeb0a82a360d478dae8bf?Expires=1687132800&Signature=iVBr0BADa3LHoFVGbwqO-wxC51n1o~ZyFD-w7nyTyFP4yB-Y6zFawL-igewaFf6PrlumCyMJThDLAAc-s-Cu35SBL8BjzLQ6HymzCXbrblUADMB208PnMAvc1EEUDq8TyryFjRO~GggLBk5yR0EXzZ3zenqnDEGEoQZR~TRqS~uDF-GwQB3eX~VdnuiU2iittWJkajIDmZtpN3yWtl4H630A3opQvBnVHZjXAL5YPkdh87-a-H~6FusWvvfJxfNC2ZzbrARzXofo8dUFtH7zUXGCC~eUk~hIuLbLuz024lFQOjiWq2VKyB7dQQuGFpM-OZQEV8tSfkViP8uzDLTaCg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

const StyledFakeMenuContent = styled.div`
  height: 400px;
  width: 100%;
`;

const StyledFakeBelowContainer = styled.div`
  height: 600px;
  position: relative;

  width: 300px;
`;

const StyledMenuAbsolutePositionWrapper = styled.div`
  height: fit-content;
  position: absolute;

  width: fit-content;
`;

const mockSelectArray = [
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
      {mockSelectArray.map((item) => (
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
      {mockSelectArray.map((item) => (
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

const WithContentBelowDecorator: Decorator = (Story) => (
  <StyledFakeBelowContainer>
    <FakeContentBelow />
    <StyledMenuAbsolutePositionWrapper>
      <Story />
    </StyledMenuAbsolutePositionWrapper>
  </StyledFakeBelowContainer>
);

export const Empty: Story = {
  args: { children: <StyledFakeMenuContent /> },
};

export const WithHeaders: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    children: (
      <>
        <DropdownMenuHeader>Header</DropdownMenuHeader>
        <StyledDropdownMenuSeparator />
        <StyledDropdownMenuSubheader>Subheader 1</StyledDropdownMenuSubheader>
        <StyledDropdownMenuItemsContainer>
          {mockSelectArray.slice(0, 3).map(({ name }) => (
            <MenuItem text={name} />
          ))}
        </StyledDropdownMenuItemsContainer>
        <StyledDropdownMenuSeparator />
        <StyledDropdownMenuSubheader>Subheader 2</StyledDropdownMenuSubheader>
        <StyledDropdownMenuItemsContainer>
          {mockSelectArray.slice(3).map(({ name }) => (
            <MenuItem text={name} />
          ))}
        </StyledDropdownMenuItemsContainer>
      </>
    ),
  },
};

export const SearchWithLoadingMenu: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    children: (
      <>
        <DropdownMenuSearchInput value="query" autoFocus />
        <StyledDropdownMenuSeparator />
        <StyledDropdownMenuItemsContainer hasMaxHeight>
          <DropdownMenuSkeletonItem />
        </StyledDropdownMenuItemsContainer>
      </>
    ),
  },
};

export const WithInput: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    children: (
      <>
        <DropdownMenuInputContainer>
          <DropdownMenuInput defaultValue="Lorem ipsum" autoFocus />
        </DropdownMenuInputContainer>
        <StyledDropdownMenuSeparator />
        <StyledDropdownMenuItemsContainer hasMaxHeight>
          {mockSelectArray.map(({ name }) => (
            <MenuItem text={name} />
          ))}
        </StyledDropdownMenuItemsContainer>
      </>
    ),
  },
};

export const SelectableMenuItemWithAvatar: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    children: (
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList hasAvatar />
      </StyledDropdownMenuItemsContainer>
    ),
  },
};

export const CheckableMenuItemWithAvatar: Story = {
  decorators: [WithContentBelowDecorator],
  args: {
    children: (
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList hasAvatar />
      </StyledDropdownMenuItemsContainer>
    ),
  },
};
