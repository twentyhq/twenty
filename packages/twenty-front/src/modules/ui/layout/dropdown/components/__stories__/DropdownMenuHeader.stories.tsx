import { type Meta, type StoryObj } from '@storybook/react-vite';

import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { IconChevronLeft } from 'twenty-ui/icon';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';

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

export const StartAvatar: Story = {
  args: {
    StartComponent: <Avatar name="placeholder" src={AVATAR_URL_MOCK} />,
    children: 'Avatar',
  },
};
