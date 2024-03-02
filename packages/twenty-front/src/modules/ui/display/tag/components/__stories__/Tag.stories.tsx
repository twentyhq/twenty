import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import {
  MAIN_COLOR_NAMES,
  ThemeColor,
} from '@/ui/theme/constants/MainColorNames';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { Tag } from '../Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Display/Tag/Tag',
  component: Tag,
  args: {
    text: 'Urgent',
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    color: 'red',
    onClick: fn(),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const tag = canvas.getByRole('heading', { level: 3 });

    await userEvent.click(tag);
    await expect(args.onClick).toHaveBeenCalled();
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

export const Catalog: CatalogStory<Story, typeof Tag> = {
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
