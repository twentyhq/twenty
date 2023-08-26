import type { Meta, StoryObj } from '@storybook/react';

import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import {
  FloatingIconButton,
  FloatingIconButtonSize,
} from '../FloatingIconButton';
import { FloatingIconButtonGroup } from '../FloatingIconButtonGroup';

const meta: Meta<typeof FloatingIconButtonGroup> = {
  title: 'UI/Button/FloatingIconButtonGroup',
  component: FloatingIconButtonGroup,
};

export default meta;
type Story = StoryObj<typeof FloatingIconButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
    children: [
      <FloatingIconButton icon={<IconNotes />} />,
      <FloatingIconButton icon={<IconCheckbox />} />,
      <FloatingIconButton icon={<IconTimelineEvent />} />,
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
      <FloatingIconButton icon={<IconNotes />} />,
      <FloatingIconButton icon={<IconCheckbox />} />,
      <FloatingIconButton icon={<IconTimelineEvent />} />,
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
          values: ['small', 'medium'] satisfies FloatingIconButtonSize[],
          props: (size: FloatingIconButtonSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
