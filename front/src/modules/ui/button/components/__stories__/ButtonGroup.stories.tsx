import { type Meta, type StoryObj } from '@storybook/react';

import { IconCheckbox, IconNotes, IconTimelineEvent } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Button, ButtonAccent, ButtonSize, ButtonVariant } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Button/ButtonGroup',
  component: ButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
    variant: 'primary',
    accent: 'danger',
    children: [
      <Button Icon={IconNotes} title="Note" />,
      <Button Icon={IconCheckbox} title="Task" />,
      <Button Icon={IconTimelineEvent} title="Activity" />,
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
      <Button Icon={IconNotes} title="Note" />,
      <Button Icon={IconCheckbox} title="Task" />,
      <Button Icon={IconTimelineEvent} title="Activity" />,
    ],
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
    children: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies ButtonSize[],
          props: (size: ButtonSize) => ({ size }),
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies ButtonAccent[],
          props: (accent: ButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies ButtonVariant[],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
