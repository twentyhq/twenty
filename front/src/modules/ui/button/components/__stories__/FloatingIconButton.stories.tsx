import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  FloatingIconButton,
  FloatingIconButtonSize,
} from '../FloatingIconButton';

const meta: Meta<typeof FloatingIconButton> = {
  title: 'UI/Button/FloatingIconButton',
  component: FloatingIconButton,
};

export default meta;
type Story = StoryObj<typeof FloatingIconButton>;

export const Default: Story = {
  args: {
    size: 'small',
    disabled: false,
    icon: <IconSearch />,
  },
  argTypes: {
    icon: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { icon: <IconSearch /> },
  argTypes: {
    size: { control: false },
    disabled: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies FloatingIconButtonSize[],
          props: (size: FloatingIconButtonSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'pressed', 'disabled', 'focus'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
              case 'pressed':
              case 'focus':
                return { className: state };
              case 'disabled':
                return { disabled: true };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
