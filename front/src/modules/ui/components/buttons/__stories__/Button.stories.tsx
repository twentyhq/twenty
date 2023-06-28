import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconSearch } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Button } from '../Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Buttons/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

const clickJestFn = jest.fn();

// Primary
export const DefaultPrimary: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A primary button" onClick={clickJestFn} />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultPrimaryHover: Story = {
  render: getRenderWrapperForComponent(<Button title="A primary button" />),
};
DefaultPrimaryHover.parameters = { pseudo: { hover: true } };

export const DefaultPrimaryDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A primary button" disabled />,
  ),
};

export const DefaultPrimaryFocused: Story = {
  render: getRenderWrapperForComponent(<Button title="A primary button" />),
};
DefaultPrimaryFocused.parameters = { pseudo: { focus: true } };

export const DefaultPrimaryWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A primary button" icon={<IconSearch size={14} />} />,
  ),
};

export const DefaultPrimaryFullWidth: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A primary button" fullWidth />,
  ),
};

// Secondary
export const DefaultSecondary: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A secondary button"
      onClick={clickJestFn}
      variant="secondary"
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultSecondaryHover: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A secondary button" variant="secondary" />,
  ),
};
DefaultSecondaryHover.parameters = { pseudo: { hover: true } };

export const DefaultSecondaryDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A secondary button" variant="secondary" disabled />,
  ),
};

export const DefaultSecondaryFocused: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A secondary button" variant="secondary" />,
  ),
};
DefaultSecondaryFocused.parameters = { pseudo: { focus: true } };

export const DefaultSecondaryWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A secondary button"
      icon={<IconSearch size={14} />}
      variant="secondary"
    />,
  ),
};

// Danger
export const DefaultDanger: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A danger button" onClick={clickJestFn} variant="danger" />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultDangerHover: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A danger button" variant="danger" />,
  ),
};
DefaultDangerHover.parameters = { pseudo: { hover: true } };

export const DefaultDangerDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A danger button" variant="danger" disabled />,
  ),
};

export const DefaultDangerFocused: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A danger button" variant="danger" />,
  ),
};
DefaultSecondaryFocused.parameters = { pseudo: { focus: true } };

export const DefaultDangerWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A danger button"
      icon={<IconSearch size={14} />}
      variant="danger"
    />,
  ),
};

// Tertiary
export const DefaultTertiary: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiary button"
      onClick={clickJestFn}
      variant="tertiary"
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultTertiaryHover: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiary button" variant="tertiary" />,
  ),
};
DefaultTertiaryHover.parameters = { pseudo: { hover: true } };

export const DefaultTertiaryDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiary button" variant="tertiary" disabled />,
  ),
};

export const DefaultTertiaryFocused: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiary button" variant="tertiary" />,
  ),
};
DefaultTertiaryFocused.parameters = { pseudo: { focus: true } };

export const DefaultTertiaryWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiary button"
      icon={<IconSearch size={14} />}
      variant="tertiary"
    />,
  ),
};

// Tertiary Bold
export const DefaultTertiaryBold: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiaryBold button"
      onClick={clickJestFn}
      variant="tertiaryBold"
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultTertiaryBoldHover: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryBold button" variant="tertiaryBold" />,
  ),
};
DefaultTertiaryBoldHover.parameters = { pseudo: { hover: true } };

export const DefaultTertiaryBoldDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryBold button" variant="tertiaryBold" disabled />,
  ),
};

export const DefaultTertiaryBoldFocused: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryBold button" variant="tertiaryBold" />,
  ),
};
DefaultTertiaryBoldFocused.parameters = { pseudo: { focus: true } };

export const DefaultTertiaryBoldWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiaryBold button"
      icon={<IconSearch size={14} />}
      variant="tertiaryBold"
    />,
  ),
};

// Tertiary Light
export const DefaultTertiaryLight: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiaryLight button"
      onClick={clickJestFn}
      variant="tertiaryLight"
    />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const DefaultTertiaryLightHover: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryLight button" variant="tertiaryLight" />,
  ),
};
DefaultTertiaryBoldHover.parameters = { pseudo: { hover: true } };

export const DefaultTertiaryLightDisabled: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryLight button" variant="tertiaryLight" disabled />,
  ),
};

export const DefaultTertiaryLightFocused: Story = {
  render: getRenderWrapperForComponent(
    <Button title="A tertiaryLight button" variant="tertiaryLight" />,
  ),
};
DefaultTertiaryBoldFocused.parameters = { pseudo: { focus: true } };

export const DefaultTertiaryLightWithIcon: Story = {
  render: getRenderWrapperForComponent(
    <Button
      title="A tertiaryLight button"
      icon={<IconSearch size={14} />}
      variant="tertiaryLight"
    />,
  ),
};
