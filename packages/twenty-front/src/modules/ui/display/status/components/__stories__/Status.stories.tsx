import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import {
  MAIN_COLOR_NAMES,
  ThemeColor,
} from '@/ui/theme/constants/MainColorNames';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { Status } from '../Status';

const meta: Meta<typeof Status> = {
  title: 'UI/Display/Status/Status',
  component: Status,
  args: {
    text: 'Urgent',
  },
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Default: Story = {
  args: {
    color: 'red',
    onClick: fn(),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const status = canvas.getByRole('heading', { level: 3 });

    await userEvent.click(status);
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const WithLongText: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  parameters: {
    container: { width: 100 },
  },
};

export const Catalog: CatalogStory<Story, typeof Status> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'colors',
          values: MAIN_COLOR_NAMES,
          props: (color: ThemeColor) => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
