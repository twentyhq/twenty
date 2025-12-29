import { type Meta, type StoryObj } from '@storybook/react';

import {
  ComponentDecorator,
  RecoilRootDecorator,
  RouterDecorator,
} from 'twenty-ui/testing';
import { Logo } from '@/auth/components/Logo';

const logoUrl = 'https://picsum.photos/192/192';

const meta: Meta<typeof Logo> = {
  title: 'Modules/Auth/Logo',
  component: Logo,
  decorators: [ComponentDecorator, RecoilRootDecorator, RouterDecorator],
};

export default meta;
type Story = StoryObj<typeof Logo>;

export const WithSecondaryLogo: Story = {
  args: {
    primaryLogo: null,
    secondaryLogo: logoUrl,
    placeholder: 'A',
  },
};

export const WithPlaceholder: Story = {
  args: {
    primaryLogo: null,
    secondaryLogo: null,
    placeholder: 'B',
  },
};

export const WithPrimaryAndSecondaryLogo: Story = {
  args: {
    primaryLogo: logoUrl,
    secondaryLogo: logoUrl,
    placeholder: 'C',
  },
};

export const WithPrimaryLogoAndPlaceholder: Story = {
  args: {
    primaryLogo: logoUrl,
    secondaryLogo: null,
    placeholder: 'D',
  },
};
