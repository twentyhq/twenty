import type { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';
import { ExhaustiveComponentDecorator } from '~/testing/decorators/ExhaustiveComponentDecorator';

import { Chip, ChipAccent, ChipSize, ChipVariant } from '../Chip';

const meta: Meta<typeof Chip> = {
  title: 'UI/Chip/Chip',
  component: Chip,
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Chip test',
    size: ChipSize.Small,
    variant: ChipVariant.Highlighted,
    accent: ChipAccent.TextPrimary,
    disabled: false,
    clickable: true,
    maxWidth: '200px',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { size: ChipSize.Large, clickable: true, label: 'Hello' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    disabled: { control: false },
    className: { control: false },
    rightComponent: { control: false },
    leftComponent: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    variants: [
      ChipVariant.Highlighted,
      ChipVariant.Regular,
      ChipVariant.Transparent,
    ],
    sizes: [ChipSize.Small, ChipSize.Large],
    accents: [ChipAccent.TextPrimary, ChipAccent.TextSecondary],
    states: ['default', 'hover', 'active', 'disabled'],
  },
  decorators: [ExhaustiveComponentDecorator],
};
