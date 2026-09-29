import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconBuildingSkyscraper, IconUser } from 'twenty-ui/icon';
import { AVATAR_URL_MOCK, ComponentDecorator } from 'twenty-ui/testing';
import { AvatarOrIcon } from '@/ui/field/display/components/internal/AvatarOrIcon/AvatarOrIcon';

const meta: Meta<typeof AvatarOrIcon> = {
  title: 'UI/Data Display/AvatarOrIcon',
  component: AvatarOrIcon,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof AvatarOrIcon>;

export const Default: Story = {
  args: {
    name: 'JD',
    colorSeed: 'John Doe',
  },
};

export const WithAvatar: Story = {
  args: {
    src: AVATAR_URL_MOCK,
    name: 'JD',
    colorSeed: 'John Doe',
  },
};

export const WithIcon: Story = {
  args: {
    Icon: IconUser,
  },
};

export const WithIconBackground: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
  },
};

export const WithInvertedIcon: Story = {
  args: {
    Icon: IconUser,
    isIconInverted: true,
  },
};

export const Clickable: Story = {
  args: {
    name: 'JD',
    colorSeed: 'John Doe',
    onClick: () => alert('AvatarOrIcon clicked'),
  },
};

export const ClickableIcon: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
    name: 'Company',
    onClick: () => alert('Icon AvatarOrIcon clicked'),
  },
};
