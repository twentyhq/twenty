import { Meta, StoryObj } from '@storybook/react';
import { expect, jest } from '@storybook/jest';

import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';

import { LinkType, SocialLink } from '../SocialLink';


const meta: Meta<typeof SocialLink> = {
  title: 'UI/Links/SocialLink',
  component: SocialLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    href: '/test',
    children: 'Social Link',
  },

};

export default meta;
type Story = StoryObj<typeof SocialLink>;
const clickJestFn = jest.fn();

const linkedin: LinkType = LinkType.LinkedIn;
const twitter: LinkType = LinkType.Twitter;

export const LinkedIn: Story = {
    args: {
        href: '/LinkedIn', 
        children: 'LinkedIn',
        onClick: clickJestFn,
        type: linkedin
    }
};

export const Twitter: Story = {
    args: {
        href: '/Twitter',
        children: 'Twitter',
        onClick: clickJestFn,
        type: twitter
    }
};

