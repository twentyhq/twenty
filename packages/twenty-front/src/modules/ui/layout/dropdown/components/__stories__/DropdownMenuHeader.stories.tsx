import { Meta, StoryObj } from '@storybook/react';
import {
  Avatar,
  AVATAR_URL_MOCK,
  ComponentDecorator,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  MenuItem,
} from 'twenty-ui';

import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { SelectHotkeyScope } from '@/ui/input/types/SelectHotkeyScope';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

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
    StartIcon: IconChevronLeft,
    children: 'Start Icon',
  },
};

export const EndIcon: Story = {
  args: {
    EndIcon: IconChevronRight,
    children: 'End Icon',
  },
};

export const StartAndEndIcon: Story = {
  args: {
    StartIcon: IconChevronLeft,
    EndIcon: IconChevronRight,
    children: 'Start and End Icon',
  },
};

export const StartAvatar: Story = {
  args: {
    StartAvatar: (
      <Avatar placeholder="placeholder" avatarUrl={AVATAR_URL_MOCK} />
    ),
    children: 'Avatar',
  },
};

export const ContextDropdownAndAvatar: Story = {
  args: {
    children: 'Context Dropdown',
    StartAvatar: (
      <Avatar placeholder="placeholder" avatarUrl={AVATAR_URL_MOCK} />
    ),
    DropdownOnEndIcon: (
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
