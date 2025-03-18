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
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';

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
    EndIcon: IconChevronRight,
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
