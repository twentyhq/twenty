import { Meta, StoryObj } from '@storybook/react';

import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';
import {
  Avatar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const meta: Meta<typeof DropdownMenuHeader> = {
  title: 'UI/Layout/Dropdown/DropdownMenuHeader',
  component: DropdownMenuHeader,
  decorators: [ComponentDecorator],
  args: {},
};

export default meta;
type Story = StoryObj<typeof DropdownMenuHeader>;

export const Text: Story = {
  args: {
    children: 'Text only',
  },
};
export const StartIcon: Story = {
  args: {
    StartComponent: <DropdownMenuHeaderLeftComponent Icon={IconChevronLeft} />,
    children: 'Start Icon',
  },
};

export const StartAndEndIcon: Story = {
  args: {
    StartComponent: <DropdownMenuHeaderLeftComponent Icon={IconChevronLeft} />,
    EndComponent: <IconChevronRight />,
    children: 'Start and End Icon',
  },
};

export const StartAvatar: Story = {
  args: {
    StartComponent: (
      <Avatar placeholder="placeholder" avatarUrl={AVATAR_URL_MOCK} />
    ),
    children: 'Avatar',
  },
};

export const ContextDropdownAndAvatar: Story = {
  args: {
    children: 'Context Dropdown',
    StartComponent: (
      <Avatar placeholder="placeholder" avatarUrl={AVATAR_URL_MOCK} />
    ),
    EndComponent: (
      <Dropdown
        dropdownId={'story-dropdown-id-context-menu'}
        dropdownHotkeyScope={{ scope: SelectHotkeyScope.Select }}
        dropdownComponents={
          <DropdownMenuItemsContainer>
            <MenuItem LeftIcon={IconPlus} text={`Create Workspace`} />
          </DropdownMenuItemsContainer>
        }
      />
    ),
  },
};
