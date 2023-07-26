import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { SubSectionTitle } from '../SubSectionTitle';

import { theme1, theme2, theme3 } from './themes';

const args = {
  title: 'Lorem ipsum',
  description: 'Lorem ipsum dolor sit amet',
};

const meta: Meta<typeof SubSectionTitle> = {
  title: 'UI/Title/SubSectionTitle',
  component: SubSectionTitle,
  decorators: [ComponentDecorator],
  args: {
    title: args.title,
  },
};

export default meta;

type Story = StoryObj<typeof SubSectionTitle>;

const defaultArgTypes = { control: false };

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  args,
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args,
  argTypes: {
    title: defaultArgTypes,
    description: defaultArgTypes,
  },
  parameters: {
    providers: Array(4).fill(ThemeProvider),
    providerProps: [
      { theme: {} },
      { theme: theme1 },
      { theme: theme2 },
      { theme: theme3 },
    ],
    catalog: [
      {
        name: 'text',
        values: ['Default', 'Md', 'Lg', 'Xl'],
        props: () => ({}),
      },
    ],
  },
  decorators: [CatalogDecorator],
};
