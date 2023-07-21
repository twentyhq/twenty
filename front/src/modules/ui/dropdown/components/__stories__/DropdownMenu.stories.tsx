import { useState } from 'react';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { IconPlus } from '@/ui/icon/index';
import { Avatar } from '@/users/components/Avatar';
import { ComponentDecorator } from '~/testing/decorators';

import { DropdownMenu } from '../DropdownMenu';
import { DropdownMenuCheckableItem } from '../DropdownMenuCheckableItem';
import { DropdownMenuItem } from '../DropdownMenuItem';
import { DropdownMenuItemsContainer } from '../DropdownMenuItemsContainer';
import { DropdownMenuSearch } from '../DropdownMenuSearch';
import { DropdownMenuSelectableItem } from '../DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '../DropdownMenuSeparator';

const meta: Meta<typeof DropdownMenu> = {
  title: 'UI/Dropdown/DropdownMenu',
  component: DropdownMenu,
  decorators: [ComponentDecorator],
  argTypes: {
    as: { table: { disable: true } },
    theme: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

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

const FakeMenuContent = styled.div`
  height: 400px;
  width: 100%;
`;

const FakeBelowContainer = styled.div`
  height: 600px;
  position: relative;

  width: 300px;
`;

const MenuAbsolutePositionWrapper = styled.div`
  height: fit-content;
  position: absolute;

  width: fit-content;
`;

const FakeMenuItemList = () => (
  <>
    <DropdownMenuItem>Company A</DropdownMenuItem>
    <DropdownMenuItem>Company B</DropdownMenuItem>
    <DropdownMenuItem>Company C</DropdownMenuItem>
    <DropdownMenuItem>Person 2</DropdownMenuItem>
    <DropdownMenuItem>Company D</DropdownMenuItem>
    <DropdownMenuItem>Person 1</DropdownMenuItem>
  </>
);

const mockSelectArray = [
  {
    id: '1',
    name: 'Company A',
    avatarUrl: avatarUrl,
  },
  {
    id: '2',
    name: 'Company B',
    avatarUrl: avatarUrl,
  },
  {
    id: '3',
    name: 'Company C',
    avatarUrl: avatarUrl,
  },
  {
    id: '4',
    name: 'Person 2',
    avatarUrl: avatarUrl,
  },
  {
    id: '5',
    name: 'Company D',
    avatarUrl: avatarUrl,
  },
  {
    id: '6',
    name: 'Person 1',
    avatarUrl: avatarUrl,
  },
];

const FakeSelectableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <>
      {mockSelectArray.map((item) => (
        <DropdownMenuSelectableItem
          key={item.id}
          selected={selectedItem === item.id}
          onClick={() => setSelectedItem(item.id)}
        >
          {hasAvatar && (
            <Avatar
              placeholder="A"
              avatarUrl={item.avatarUrl}
              size={16}
              type="squared"
            />
          )}
          {item.name}
        </DropdownMenuSelectableItem>
      ))}
    </>
  );
};

const FakeCheckableMenuItemList = ({ hasAvatar }: { hasAvatar?: boolean }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <>
      {mockSelectArray.map((item) => (
        <DropdownMenuCheckableItem
          key={item.id}
          id={item.id}
          checked={selectedItems.includes(item.id)}
          onChange={(checked) => {
            if (checked) {
              setSelectedItems([...selectedItems, item.id]);
            } else {
              setSelectedItems(selectedItems.filter((id) => id !== item.id));
            }
          }}
        >
          {hasAvatar && (
            <Avatar
              placeholder="A"
              avatarUrl={item.avatarUrl}
              size={16}
              type="squared"
            />
          )}
          {item.name}
        </DropdownMenuCheckableItem>
      ))}
    </>
  );
};

export const Empty: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <FakeMenuContent />
    </DropdownMenu>
  ),
};

export const WithContentBelow: Story = {
  ...Empty,
  decorators: [
    (Story) => (
      <FakeBelowContainer>
        <FakeContentBelow />
        <MenuAbsolutePositionWrapper>
          <Story />
        </MenuAbsolutePositionWrapper>
      </FakeBelowContainer>
    ),
  ],
};

export const SimpleMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeMenuItemList />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const Search: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuSearch />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeMenuItemList />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const Button: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <DropdownMenuItem>
          <IconPlus size={16} />
          <div>Create new</div>
        </DropdownMenuItem>
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const SelectableMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const SelectableMenuItemWithAvatar: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList hasAvatar />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const CheckableMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};

export const CheckableMenuItemWithAvatar: Story = {
  ...WithContentBelow,
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList hasAvatar />
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  ),
};
