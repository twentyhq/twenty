import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent } from '@storybook/testing-library';

import { ThemeColor } from '@/ui/theme/constants/colors';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { CatalogStory } from '~/testing/types';

import { Tag, TagColor } from '../Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Tag/Tag',
  component: Tag,
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    text: 'Urgent',
    color: 'red',
  },
  argTypes: { onClick: { action: 'clicked' } },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const tag = canvasElement.querySelector('h3');

    if (!tag) throw new Error('Tag not found');

    await userEvent.click(tag);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Catalog: CatalogStory<Story, typeof Tag> = {
  args: { text: 'Urgent' },
  argTypes: {
    color: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'colors',
          values: [
            'green',
            'turquoise',
            'sky',
            'blue',
            'purple',
            'pink',
            'red',
            'orange',
            'yellow',
            'gray',
          ] satisfies TagColor[],
          props: (color: ThemeColor) => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
