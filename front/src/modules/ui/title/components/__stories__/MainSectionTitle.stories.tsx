import { ThemeProvider } from '@emotion/react';
import type { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { MainSectionTitle } from '../MainSectionTitle';

import { theme1, theme2, theme3 } from './themes';

const meta: Meta<typeof MainSectionTitle> = {
  title: 'UI/Title/MainSectionTitle',
  component: MainSectionTitle,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof MainSectionTitle>;

const defaultArgTypes = { control: false };

const args = {
  children: 'Lorem ipsum',
};

export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args,
  argTypes: {
    children: defaultArgTypes,
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
