import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { SnackBar, SnackBarVariant } from '../SnackBar';

const meta: Meta<typeof SnackBar> = {
  title: 'UI/Feedback/SnackBarManager/SnackBar',
  component: SnackBar,
  decorators: [SnackBarDecorator],
  argTypes: {
    className: { control: false },
    icon: { control: false },
  },
  args: {
    title: 'Lorem ipsum',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec eros tincidunt lacinia.',
    onCancel: undefined,
    onClose: fn(),
    role: 'status',
    variant: SnackBarVariant.Default,
  },
};

export default meta;
type Story = StoryObj<typeof SnackBar>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export const Catalog: CatalogStory<Story, typeof SnackBar> = {
  args: {
    onCancel: fn(),
  },
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'progress',
          values: [0, 75, 100],
          props: (progress) => ({ progress }),
        },
        {
          name: 'variants',
          values: Object.values(SnackBarVariant),
          props: (variant: SnackBarVariant) => ({ variant }),
        },
      ],
    },
  },
};
