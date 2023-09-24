import { expect } from '@storybook/jest';
import { type Meta, type StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { IconCheckbox } from '@/ui/icon';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { TabList } from '../TabList';

const tabs = [
  {
    id: '1',
    title: 'Tab1',
    Icon: IconCheckbox,
    hide: true,
  },
  {
    id: '2',
    title: 'Tab2',
    Icon: IconCheckbox,
    hide: false,
  },
  {
    id: '3',
    title: 'Tab3',
    Icon: IconCheckbox,
    hide: false,
    disabled: true,
  },
  {
    id: '4',
    title: 'Tab4',
    Icon: IconCheckbox,
    hide: false,
    disabled: false,
  },
];

const meta: Meta<typeof TabList> = {
  title: 'UI/Tab/TabList',
  component: TabList,
  args: {
    tabs: tabs,
  },
  decorators: [
    (Story) => (
      <RecoilScope>
        <Story />
      </RecoilScope>
    ),
    ComponentDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof TabList>;

export const TabListDisplay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitButton = canvas.queryByText('Tab1');
    expect(submitButton).toBeNull();
    expect(await canvas.findByText('Tab2')).toBeInTheDocument();
    expect(await canvas.findByText('Tab3')).toBeInTheDocument();
    expect(await canvas.findByText('Tab4')).toBeInTheDocument();
  },
};
