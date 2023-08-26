import { useState } from 'react';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { IconButton } from '@/ui/button/components/IconButton';
import { IconPlus, IconUser } from '@/ui/icon';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { Avatar } from '@/users/components/Avatar';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { DropdownMenuCheckableItem } from '../DropdownMenuCheckableItem';
import { DropdownMenuHeader } from '../DropdownMenuHeader';
import { DropdownMenuInput } from '../DropdownMenuInput';
import { DropdownMenuItem } from '../DropdownMenuItem';
import { DropdownMenuSelectableItem } from '../DropdownMenuSelectableItem';
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
    theme: { table: { disable: true } },
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
        <DropdownMenuSelectableItem
          key={item.id}
          selected={selectedItem === item.id}
          onClick={() => setSelectedItem(item.id)}
        >
          {hasAvatar && (
            <Avatar
              placeholder="A"
              avatarUrl={item.avatarUrl}
              size="md"
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
              size="md"
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
    <StyledDropdownMenu {...args}>
      <StyledFakeMenuContent />
    </StyledDropdownMenu>
  ),
};

export const WithContentBelow: Story = {
  ...Empty,
  decorators: [
    (Story) => (
      <StyledFakeBelowContainer>
        <FakeContentBelow />
        <StyledMenuAbsolutePositionWrapper>
          <Story />
        </StyledMenuAbsolutePositionWrapper>
      </StyledFakeBelowContainer>
    ),
  ],
};

export const SimpleMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        {mockSelectArray.map(({ name }) => (
          <DropdownMenuItem>{name}</DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const WithHeaders: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <DropdownMenuHeader>Header</DropdownMenuHeader>
      <StyledDropdownMenuSeparator />
      <StyledDropdownMenuSubheader>Subheader 1</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {mockSelectArray.slice(0, 3).map(({ name }) => (
          <DropdownMenuItem>{name}</DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
      <StyledDropdownMenuSeparator />
      <StyledDropdownMenuSubheader>Subheader 2</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {mockSelectArray.slice(3).map(({ name }) => (
          <DropdownMenuItem>{name}</DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const WithIcons: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        {mockSelectArray.map(({ name }) => (
          <DropdownMenuItem>
            <IconUser size={16} />
            {name}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const WithActions: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        {mockSelectArray.map(({ name }, index) => (
          <DropdownMenuItem
            className={index === 0 ? 'hover' : undefined}
            actions={[
              <IconButton icon={<IconUser />} />,
              <IconButton icon={<IconPlus />} />,
            ]}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
  parameters: {
    pseudo: { hover: ['.hover'] },
  },
};

export const LoadingMenu: Story = {
  ...WithContentBelow,
  render: () => (
    <StyledDropdownMenu>
      <DropdownMenuInput value={'query'} autoFocus />
      <StyledDropdownMenuSeparator />
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <DropdownMenuSkeletonItem />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const Search: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <DropdownMenuInput />
      <StyledDropdownMenuSeparator />
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        {mockSelectArray.map(({ name }) => (
          <DropdownMenuItem>{name}</DropdownMenuItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const SelectableMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const SelectableMenuItemWithAvatar: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeSelectableMenuItemList hasAvatar />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const CheckableMenuItem: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};

export const CheckableMenuItemWithAvatar: Story = {
  ...WithContentBelow,
  render: (args) => (
    <StyledDropdownMenu {...args}>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        <FakeCheckableMenuItemList hasAvatar />
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  ),
};
