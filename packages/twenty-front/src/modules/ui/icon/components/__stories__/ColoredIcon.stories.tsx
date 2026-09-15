import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconBuildingSkyscraper, IconFolder, IconLink } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';

const meta: Meta<typeof ColoredIcon> = {
  title: 'UI/Icon/ColoredIcon',
  component: ColoredIcon,
  decorators: [ComponentDecorator],
  args: { Icon: IconBuildingSkyscraper, color: 'blue' },
};

export default meta;
type Story = StoryObj<typeof ColoredIcon>;

export const Object: Story = {};
export const Folder: Story = { args: { Icon: IconFolder, color: 'orange' } };
export const Link: Story = { args: { Icon: IconLink, color: 'green' } };
