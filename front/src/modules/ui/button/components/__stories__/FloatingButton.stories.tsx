import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FloatingButton, FloatingButtonSize } from '../FloatingButton';

const meta: Meta<typeof FloatingButton> = {
  title: 'UI/Button/FloatingButton',
  component: FloatingButton,
};

export default meta;
type Story = StoryObj<typeof FloatingButton>;

export const Default: Story = {
  args: {
    title: 'Filter',
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
  args: { title: 'Filter', icon: <IconSearch /> },
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
          values: ['small', 'medium'] satisfies FloatingButtonSize[],
          props: (size: FloatingButtonSize) => ({ size }),
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
