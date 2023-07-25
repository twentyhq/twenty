import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconSearch } from '@/ui/icon';
import { CatalogDecorator } from '~/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Button, ButtonPosition, ButtonSize, ButtonVariant } from '../Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button/Button',
  component: Button,
  argTypes: {
    icon: {
      type: 'boolean',
      mapping: {
        true: <IconSearch size={14} />,
        false: undefined,
      },
    },
    position: {
      control: 'radio',
      options: [undefined, ...Object.values(ButtonPosition)],
    },
  },
  args: { title: 'Lorem ipsum' },
};

export default meta;
type Story = StoryObj<typeof Button>;

const clickJestFn = jest.fn();

export const Default: Story = {
  args: { onClick: clickJestFn },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(button);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
};

export const Sizes: Story = {
  argTypes: {
    size: { control: false },
  },
  parameters: {
    catalog: [
      {
        name: 'sizes',
        values: Object.values(ButtonSize),
        props: (size: ButtonSize) => ({ size }),
      },
    ],
  },
  decorators: [CatalogDecorator],
};

export const Variants: Story = {
  argTypes: {
    disabled: { control: false },
    variant: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'], focus: ['.focus'] },
    catalog: [
      {
        name: 'state',
        values: ['default', 'disabled', 'hover', 'active', 'focus'],
        props: (state: string) => {
          if (state === 'disabled') return { disabled: true };
          if (state === 'default') return {};
          return { className: state };
        },
      },
      {
        name: 'variants',
        values: Object.values(ButtonVariant),
        props: (variant: ButtonVariant) => ({ variant }),
      },
    ],
  },
  decorators: [CatalogDecorator],
};

export const Positions: Story = {
  argTypes: {
    position: { control: false },
  },
  parameters: {
    catalog: [
      {
        name: 'positions',
        values: ['none', ...Object.values(ButtonPosition)],
        props: (position: ButtonPosition | 'none') =>
          position === 'none' ? {} : { position },
      },
    ],
  },
  decorators: [CatalogDecorator],
};

export const WithAdornments: Story = {
  parameters: {
    catalog: [
      {
        name: 'adornments',
        values: ['with icon', 'with soon pill'],
        props: (value: string) =>
          value === 'with icon'
            ? { icon: <IconSearch size={14} /> }
            : { soon: true },
      },
    ],
  },
  decorators: [CatalogDecorator],
};
