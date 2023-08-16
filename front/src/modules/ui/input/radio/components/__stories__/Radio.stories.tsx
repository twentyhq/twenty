import type { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { LabelPosition, Radio, RadioSize } from '../Radio';

const meta: Meta<typeof Radio> = {
  title: 'UI/Input/Radio',
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    value: 'Radio',
    checked: false,
    disabled: false,
    size: RadioSize.Small,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: {
    value: 'Radio',
  },
  argTypes: {
    value: { control: false },
    size: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'checked',
          values: [false, true],
          props: (checked: boolean) => ({ checked }),
        },
        {
          name: 'disabled',
          values: [false, true],
          props: (disabled: boolean) => ({ disabled }),
        },
        {
          name: 'size',
          values: Object.values(RadioSize),
          props: (size: RadioSize) => ({ size }),
        },
        {
          name: 'labelPosition',
          values: Object.values(LabelPosition),
          props: (labelPosition: string) => ({
            labelPosition,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
