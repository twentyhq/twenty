import { Meta, StoryObj } from '@storybook/react';

import { NavigationDrawerCollapseButton } from '../NavigationDrawerCollapseButton';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof NavigationDrawerCollapseButton> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawerCollapseButton',
  decorators: [ComponentDecorator],
  component: NavigationDrawerCollapseButton,
};

export default meta;
type Story = StoryObj<typeof NavigationDrawerCollapseButton>;

export const Default: Story = {};
