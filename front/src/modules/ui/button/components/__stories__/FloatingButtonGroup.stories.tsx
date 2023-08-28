import type { Meta, StoryObj } from '@storybook/react';

import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { FloatingButton, FloatingButtonSize } from '../FloatingButton';
import { FloatingButtonGroup } from '../FloatingButtonGroup';

const meta: Meta<typeof FloatingButtonGroup> = {
  title: 'UI/Button/FloatingButtonGroup',
  component: FloatingButtonGroup,
};

export default meta;
type Story = StoryObj<typeof FloatingButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
    children: [
      <FloatingButton icon={<IconNotes />} />,
      <FloatingButton icon={<IconCheckbox />} />,
      <FloatingButton icon={<IconTimelineEvent />} />,
    ],
  },
  argTypes: {
    children: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: {
    children: [
      <FloatingButton icon={<IconNotes />} />,
      <FloatingButton icon={<IconCheckbox />} />,
      <FloatingButton icon={<IconTimelineEvent />} />,
    ],
  },
  argTypes: {
    size: { control: false },
    children: { control: false },
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
      ],
    },
  },
  decorators: [CatalogDecorator],
};
