import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  IconButton,
  IconButtonAccent,
  IconButtonPosition,
  IconButtonSize,
  IconButtonVariant,
} from '../IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'UI/Button/IconButton',
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {
    title: 'IconButton',
    size: 'small',
    variant: 'primary',
    accent: 'danger',
    disabled: false,
    position: 'standalone',
    icon: <IconSearch />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { title: 'Filter', icon: <IconSearch /> },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    icon: { control: false },
    position: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies IconButtonSize[],
          props: (size: IconButtonSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'pressed', 'disabled', 'focus'],
          props: (state: string) =>
            state === 'default'
              ? {}
              : state !== 'disabled'
              ? { className: state }
              : { disabled: true },
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies IconButtonAccent[],
          props: (accent: IconButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies IconButtonVariant[],
          props: (variant: IconButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const PositionCatalog: Story = {
  args: { title: 'Filter', icon: <IconSearch /> },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    disabled: { control: false },
    position: { control: false },
    icon: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'positions',
          values: [
            'standalone',
            'left',
            'middle',
            'right',
          ] satisfies IconButtonPosition[],
          props: (position: IconButtonPosition) => ({ position }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'pressed', 'disabled', 'focus'],
          props: (state: string) =>
            state === 'default'
              ? {}
              : state !== 'disabled'
              ? { className: state }
              : { disabled: true },
        },
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies IconButtonSize[],
          props: (size: IconButtonSize) => ({ size }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies IconButtonVariant[],
          props: (variant: IconButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
