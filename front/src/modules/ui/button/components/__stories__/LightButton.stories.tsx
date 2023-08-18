import type { Meta, StoryObj } from '@storybook/react';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { LightButton, LightButtonAccent } from '../LightButton';

const meta: Meta<typeof LightButton> = {
  title: 'UI/Button/LightButton',
  component: LightButton,
};

export default meta;
type Story = StoryObj<typeof LightButton>;

export const Default: Story = {
  args: {
    title: 'Filter',
    accent: 'secondary',
    disabled: false,
    active: false,
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
    accent: { control: false },
    disabled: { control: false },
    active: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'accents',
          values: ['secondary', 'tertiary'] satisfies LightButtonAccent[],
          props: (accent: LightButtonAccent) => ({ accent }),
        },
        {
          name: 'states',
          values: [
            'default',
            'hover',
            'pressed',
            'disabled',
            'active',
            'focus',
          ],
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
              case 'active':
                return { active: true };
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
