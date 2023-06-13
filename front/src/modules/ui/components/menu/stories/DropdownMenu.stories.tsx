import React, { useState } from 'react';
import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';
import { IconPlus } from '@tabler/icons-react';

import { Avatar } from '@/users/components/Avatar';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { DropdownMenu } from '../DropdownMenu';
import { DropdownMenuButton } from '../DropdownMenuButton';
import { DropdownMenuCheckableItem } from '../DropdownMenuCheckableItem';
import { DropdownMenuItem } from '../DropdownMenuItem';
import { DropdownMenuItemContainer } from '../DropdownMenuItemContainer';
import { DropdownMenuSearch } from '../DropdownMenuSearch';
import { DropdownMenuSelectableItem } from '../DropdownMenuSelectableItem';
import { DropdownMenuSeparator } from '../DropdownMenuSeparator';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

const FakeContentBelow = () => (
  <div style={{ position: 'absolute' }}>
    askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd alskjd alksjd
    alksjd laksjd askjdlaksjdlaksjdlakjsdlkj lkajsldkjalskd jalksdj alksjd
  </div>
);

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/bbb5/4905/f0a52cc2b9aaeb0a82a360d478dae8bf?Expires=1687132800&Signature=iVBr0BADa3LHoFVGbwqO-wxC51n1o~ZyFD-w7nyTyFP4yB-Y6zFawL-igewaFf6PrlumCyMJThDLAAc-s-Cu35SBL8BjzLQ6HymzCXbrblUADMB208PnMAvc1EEUDq8TyryFjRO~GggLBk5yR0EXzZ3zenqnDEGEoQZR~TRqS~uDF-GwQB3eX~VdnuiU2iittWJkajIDmZtpN3yWtl4H630A3opQvBnVHZjXAL5YPkdh87-a-H~6FusWvvfJxfNC2ZzbrARzXofo8dUFtH7zUXGCC~eUk~hIuLbLuz024lFQOjiWq2VKyB7dQQuGFpM-OZQEV8tSfkViP8uzDLTaCg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

const FakeMenuContent = styled.div`
  width: 100%;
  height: 400px;
`;

const FakeBelowContainer = styled.div`
  width: 300px;
  height: 600px;

  position: relative;
`;

const MenuAbsolutePositionWrapper = styled.div`
  width: fit-content;
  height: fit-content;

  position: absolute;
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

export const Empty: Story = {
  render: getRenderWrapperForComponent(
    <DropdownMenu>
      <FakeMenuContent />
    </DropdownMenu>,
  ),
};

const DropdownMenuStoryWrapper = ({
  children,
}: React.PropsWithChildren<unknown>) => (
  <FakeBelowContainer>
    <FakeContentBelow />
    <MenuAbsolutePositionWrapper>
      <DropdownMenu>{children}</DropdownMenu>
    </MenuAbsolutePositionWrapper>
  </FakeBelowContainer>
);

export const EmptyWithContentBelow: Story = {
  render: getRenderWrapperForComponent(
    <DropdownMenuStoryWrapper>
      <FakeMenuContent />
    </DropdownMenuStoryWrapper>,
  ),
};

export const SimpleMenuItem: Story = {
  render: getRenderWrapperForComponent(
    <DropdownMenuStoryWrapper>
      <DropdownMenuItemContainer>
        <FakeMenuItemList />
      </DropdownMenuItemContainer>
    </DropdownMenuStoryWrapper>,
  ),
};

export const Search: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuSearch />
          <DropdownMenuSeparator />
          <DropdownMenuItemContainer>
            <FakeMenuItemList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};

const FakeSelectableMenuItemList = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <>
      {mockSelectArray.map((item) => (
        <DropdownMenuSelectableItem
          key={item.id}
          selected={selectedItem === item.id}
          onClick={() => setSelectedItem(item.id)}
        >
          {item.name}
        </DropdownMenuSelectableItem>
      ))}
    </>
  );
};

export const Button: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuItemContainer>
            <DropdownMenuButton>
              <IconPlus size={16} />
              <div>Create new</div>
            </DropdownMenuButton>
          </DropdownMenuItemContainer>
          <DropdownMenuSeparator />
          <DropdownMenuItemContainer>
            <FakeSelectableMenuItemList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};

export const SelectableMenuItem: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuItemContainer>
            <FakeSelectableMenuItemList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};

const FakeSelectableMenuItemWithAvatarList = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <>
      {mockSelectArray.map((item) => (
        <DropdownMenuSelectableItem
          key={item.id}
          selected={selectedItem === item.id}
          onClick={() => setSelectedItem(item.id)}
        >
          <Avatar
            placeholderLetter="A"
            avatarUrl={item.avatarUrl}
            size={16}
            type="squared"
          />
          {item.name}
        </DropdownMenuSelectableItem>
      ))}
    </>
  );
};

export const SelectableMenuItemWithAvatar: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuItemContainer>
            <FakeSelectableMenuItemWithAvatarList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};

const FakeCheckableMenuItemList = () => {
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
          {item.name}
        </DropdownMenuCheckableItem>
      ))}
    </>
  );
};

export const CheckableMenuItem: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuItemContainer>
            <FakeCheckableMenuItemList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};

const FakeCheckableMenuItemWithAvatarList = () => {
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
          <Avatar
            placeholderLetter="A"
            avatarUrl={item.avatarUrl}
            size={16}
            type="squared"
          />
          {item.name}
        </DropdownMenuCheckableItem>
      ))}
    </>
  );
};

export const CheckableMenuItemWithAvatar: Story = {
  render: getRenderWrapperForComponent(
    <FakeBelowContainer>
      <FakeContentBelow />
      <MenuAbsolutePositionWrapper>
        <DropdownMenu>
          <DropdownMenuItemContainer>
            <FakeCheckableMenuItemWithAvatarList />
          </DropdownMenuItemContainer>
        </DropdownMenu>
      </MenuAbsolutePositionWrapper>
    </FakeBelowContainer>,
  ),
};
