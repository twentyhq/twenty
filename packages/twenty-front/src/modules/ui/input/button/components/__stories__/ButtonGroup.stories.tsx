import { Meta, StoryObj } from '@storybook/react';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
  IconCheckbox,
  IconNotes,
  IconTimelineEvent,
} from 'twenty-ui';

import { Button, ButtonAccent, ButtonSize, ButtonVariant } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Input/Button/ButtonGroup',
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

export const Catalog: CatalogStory<Story, typeof ButtonGroup> = {
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
