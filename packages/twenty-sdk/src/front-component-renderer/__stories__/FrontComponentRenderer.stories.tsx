import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../host/components/FrontComponentRenderer';

import { getBuiltStoryComponentPathForRender } from './utils/getBuiltStoryComponentPathForRender';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/FrontComponentRenderer',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: {
    onError: errorHandler,
    applicationAccessToken: 'fake-token',
  },
  beforeEach: () => {
    errorHandler.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

export const Static: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender('static.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const container = await canvas.findByTestId(
      'static-component',
      {},
      { timeout: 30000 },
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
    componentUrl: getBuiltStoryComponentPathForRender('interactive.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('interactive-component', {}, { timeout: 10000 });

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
    componentUrl: getBuiltStoryComponentPathForRender('lifecycle.front-component'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId('lifecycle-component', {}, { timeout: 10000 });

    expect(await canvas.findByText('Mounted')).toBeVisible();

    await waitFor(
      () => {
        const tickElement = canvas.getByTestId('tick-count');
        expect(tickElement.textContent).toMatch(/Ticks: [1-9]\d*/);
      },
      { timeout: 10000 },
    );
  },
};

export const ChakraExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'chakra-example.front-component',
    ),
  },
};

export const TailwindExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'tailwind-example.front-component',
    ),
  },
};

export const EmotionExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'emotion-example.front-component',
    ),
  },
};

export const StyledComponentsExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'styled-components-example.front-component',
    ),
  },
};

export const ShadcnExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'shadcn-example.front-component',
    ),
  },
};

export const MuiExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'mui-example.front-component',
    ),
  },
};

export const TwentyUiExample: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      'twenty-ui-example.front-component',
    ),
  },
};

export const ErrorHandling: Story = {
  args: {
    componentUrl: getBuiltStoryComponentPathForRender('nonexistent.front-component'),
  },
  play: async () => {
    await waitFor(
      () => {
        expect(errorHandler).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  },
};
