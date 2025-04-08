import { Meta, StoryObj } from '@storybook/react';

import { Tab } from '../Tab';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from 'twenty-ui/testing';
import { IconCheckbox } from 'twenty-ui/display';

const meta: Meta<typeof Tab> = {
  title: 'UI/Layout/Tab/Tab',
  component: Tab,
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    title: 'Tab title',
    active: false,
    Icon: IconCheckbox,
    disabled: false,
  },

  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Tab> = {
  args: { title: 'Tab title', Icon: IconCheckbox },
  argTypes: {
    active: { control: false },
    disabled: { control: false },
    onClick: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: ['default', 'hover', 'active'],
          props: (state: string) =>
            state === 'default' ? {} : { className: state },
        },
        {
          name: 'Active',
          values: ['true', 'false'],
          labels: (active: string) =>
            active === 'true' ? 'active' : 'inactive',
          props: (active: string) => ({ active: active === 'true' }),
        },
        {
          name: 'Disabled',
          values: ['true', 'false'],
          labels: (disabled: string) =>
            disabled === 'true' ? 'disabled' : 'enabled',
          props: (disabled: string) => ({ disabled: disabled === 'true' }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
