import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconBrandGoogle } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { MainButton } from '../MainButton';

const meta: Meta<typeof MainButton> = {
  title: 'UI/Buttons/MainButton',
  component: MainButton,
};

export default meta;
type Story = StoryObj<typeof MainButton>;

const clickJestFn = jest.fn();

export const DefaultPrimary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton title="A primary Button" onClick={clickJestFn} />,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);
    const button = canvas.getByRole('button');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const WithIconPrimary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton
      icon={<IconBrandGoogle size={16} stroke={4} />}
      title="A primary Button"
    />,
  ),
};

export const WithIconPrimaryDisabled: Story = {
  render: getRenderWrapperForComponent(
    <MainButton
      icon={<IconBrandGoogle size={16} stroke={4} />}
      title="A primary Button"
      disabled
    />,
  ),
};

export const FullWidthPrimary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton title="A primary Button" fullWidth />,
  ),
};

export const DefaultSecondary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton
      title="A secondary Button"
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

export const WithIconSecondary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton
      icon={<IconBrandGoogle size={16} stroke={4} />}
      title="A secondary Button"
      variant="secondary"
    />,
  ),
};

export const WithIconSecondaryDisabled: Story = {
  render: getRenderWrapperForComponent(
    <MainButton
      icon={<IconBrandGoogle size={16} stroke={4} />}
      title="A secondary Button"
      variant="secondary"
      disabled
    />,
  ),
};

export const FullWidthSecondary: Story = {
  render: getRenderWrapperForComponent(
    <MainButton title="A secondary Button" variant="secondary" fullWidth />,
  ),
};
