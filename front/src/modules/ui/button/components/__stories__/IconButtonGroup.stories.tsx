import type { Meta, StoryObj } from '@storybook/react';

import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Button } from '../Button';
import {
  IconButtonAccent,
  IconButtonSize,
  IconButtonVariant,
} from '../IconButton';
import { IconButtonGroup } from '../IconButtonGroup';

const meta: Meta<typeof IconButtonGroup> = {
  title: 'UI/Button/IconButtonGroup',
  component: IconButtonGroup,
};

export default meta;
type Story = StoryObj<typeof IconButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
    variant: 'primary',
    accent: 'danger',
    children: [
      <Button Icon={IconNotes} />,
      <Button Icon={IconCheckbox} />,
      <Button Icon={IconTimelineEvent} />,
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
      <Button Icon={IconNotes} />,
      <Button Icon={IconCheckbox} />,
      <Button Icon={IconTimelineEvent} />,
    ],
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    children: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies IconButtonSize[],
          props: (size: IconButtonSize) => ({ size }),
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies IconButtonAccent[],
          props: (accent: IconButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies IconButtonVariant[],
          props: (variant: IconButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
