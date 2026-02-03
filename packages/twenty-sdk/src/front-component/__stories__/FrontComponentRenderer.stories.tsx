import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '../host/components/FrontComponentRenderer';

import { getBuiltComponentPath } from './utils/loadBuiltComponent';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/FrontComponentRenderer',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: {
    onError: errorHandler,
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

export const Static: Story = {
  args: {
    componentUrl: getBuiltComponentPath('static.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const container = await canvas.findByTestId(
      'static-component',
      {},
      { timeout: 5000 },
    );
    expect(container).toBeVisible();
    expect(container).toHaveStyle({
      backgroundColor: '#f0f4f8',
      borderRadius: '8px',
    });

    const heading = await canvas.findByText('Static Component');
    expect(heading).toBeVisible();
    expect(heading).toHaveStyle({ fontWeight: '700' });

    const badge = await canvas.findByTestId('styled-badge');
    expect(badge).toBeVisible();
    expect(badge).toHaveStyle({ backgroundColor: '#48bb78' });
  },
};

export const Interactive: Story = {
  args: {
    componentUrl: getBuiltComponentPath('interactive.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('interactive-component', {}, { timeout: 5000 });

    expect(await canvas.findByText('Count: 0')).toBeVisible();

    const button = await canvas.findByTestId('increment-button');
    await userEvent.click(button);
    expect(await canvas.findByText('Count: 1')).toBeVisible();

    await userEvent.click(button);
    expect(await canvas.findByText('Count: 2')).toBeVisible();
  },
};

export const Lifecycle: Story = {
  args: {
    componentUrl: getBuiltComponentPath('lifecycle.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('lifecycle-component', {}, { timeout: 5000 });

    expect(await canvas.findByText('Mounted')).toBeVisible();

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const tickElement = await canvas.findByTestId('tick-count');
    expect(tickElement.textContent).toMatch(/Ticks: [1-9]/);
  },
};

export const ErrorHandling: Story = {
  args: {
    componentUrl: '/built/nonexistent.front-component.mjs',
  },
  play: async () => {
    errorHandler.mockClear();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(errorHandler).toHaveBeenCalled();
  },
};
