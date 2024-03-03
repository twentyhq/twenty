import { ReactNode, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { Icon123 } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { ComponentDecorator } from '~/testing/decorators/ComponentDecorator';

import { Select, SelectProps } from '../Select';

type RenderProps = SelectProps<
  string | number | null,
  IconComponent | ReactNode | null
>;

const Render = (args: RenderProps) => {
  const [value, setValue] = useState(args.value);
  const handleChange = (value: string | number | null) => {
    args.onChange?.(value);
    setValue(value);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Select {...args} value={value} onChange={handleChange} />;
};

const meta: Meta<typeof Select> = {
  title: 'UI/Input/Select',
  component: Select,
  decorators: [ComponentDecorator],
  args: {
    dropdownId: 'select',
    value: 'a',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
  },
  render: Render,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectLabel = await canvas.getByText('Option A');

    await userEvent.click(selectLabel);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithSearch: Story = {
  args: { withSearchInput: true },
};

export const WithAvatarOptions: Story = {
  args: {
    options: [
      { value: 'a', label: 'Option A', avatarOrIcon: Icon123 },
      {
        value: 'b',
        label: 'Option B',
        avatarOrIcon: (
          <img
            height="15"
            width="15"
            alt="logo"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACb0lEQVR4nO2VO4taQRTHr3AblbjxEVlwCwVhg7BoqqCIjy/gAyyFWNlYBOxsfH0KuxgQGwXRUkGuL2S7i1barGAgiwbdW93SnGOc4BonPiKahf3DwXFmuP/fPM4ZlvmlTxAhCBdzHnEQWYiv7Mr4C3NeuVYhQYDPzOUUQgDLBQGcLHNhvQK8DACPx8PTxiqVyvISG43GbyaT6Qfpn06n0m63e/tPAPF4vJ1MJu8kEsnWTCkWi1yr1RKGw+GDRqPBOTfr44vFQvD7/Q/lcpmaaVQAr9fLp1IpO22c47hGOBz+MB6PH+Vy+VYDAL8qlUoGtVotzOfzq4MAgsHgE/6KojiQyWR/bKVSqbSszHFM8Pl8z1YK48JsNltCOBwOnrYLO+8AAIjb+nHbycoTiUQfDJ7tFq4YAHiVSmXBxcD41u8flQU8z7fhzO0r83atVns3Go3u9Xr9x0O/RQXo9/tsIBBg6vX606a52Wz+bZ7P5/WwG29gxSJzhKgA6XTaDoFNF+krFAocmC//4yWEcSf2wTm7mCO19xFgSsKOLI16vV7b7XY7mRNoLwA0JymJ5uQIzgIAuX5PzDElT2m+E8BqtQ4ymcx7Yq7T6a6ZE4sKgOadTucaCwkxp1UzlEKh0GDxIXOwDWHAdi6Xe3swQDQa/Q7mywoolUpvsaptymazDWKxmBHTlWXZm405BFZoNpuGgwEmk4mE2SGtVivii4f1AO7J3ZopkQCQj7Ar1FeRChCJRJzVapX6DKNIfSc1Ax+wtQWQ55h6bH8FWDfYV4fO3wlwDr0C/BcADYiTPCxHqIEA2QsCZAkAKnRGkMbKN/sTX5YHPQ1e7SkAAAAASUVORK5CYII="
          />
        ),
      },
    ],
  },
};
