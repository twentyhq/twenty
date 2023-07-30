import type { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Tab } from '../Tab';

const meta: Meta<typeof Tab> = {
  title: 'UI/Tab/Tab',
  component: Tab,
};

export default meta;
type Story = StoryObj<typeof Tab>;

export const Default: Story = {
  args: {
    title: 'Tab title',
    active: false,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { title: 'Tab title' },
  argTypes: {
    active: { control: false },
    onClick: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: [
      {
        name: 'states',
        values: ['default', 'hover', 'active'],
        props: (state: string) =>
          state === 'default' ? {} : { className: state },
      },
      {
        name: 'Active',
        values: ['true', 'false'],
        props: (active: string) => ({ active: active === 'true' }),
      },
    ],
  },
  decorators: [CatalogDecorator],
};
