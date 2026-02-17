import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../host/components/FrontComponentRenderer';

import { getBuiltStoryComponentPathForRender } from './utils/getBuiltStoryComponentPathForRender';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Feature',
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

const createComponentStory = (
  name: string,
  options?: { runtime?: 'preact'; play?: Story['play'] },
): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      options?.runtime,
    ),
  },
  ...(options?.play ? { play: options.play } : {}),
});

export const Static: Story = {
  ...createComponentStory('static'),
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
  ...createComponentStory('interactive'),
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
  ...createComponentStory('lifecycle'),
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

export const ErrorHandling: Story = {
  ...createComponentStory('nonexistent'),
  play: async () => {
    await waitFor(
      () => {
        expect(errorHandler).toHaveBeenCalled();
      },
      { timeout: 10000 },
    );
  },
};

export const SdkContext: Story = {
  ...createComponentStory('sdk-context-example'),
  args: {
    ...createComponentStory('sdk-context-example').args,
    executionContext: { userId: 'test-user-abc-123' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      'sdk-context-component',
      {},
      { timeout: 30000 },
    );

    const userIdElement = await canvas.findByTestId('sdk-context-user-id');
    expect(userIdElement).toBeVisible();
    expect(userIdElement).toHaveTextContent('test-user-abc-123');

    const jsonElement = await canvas.findByTestId('sdk-context-json');
    expect(jsonElement).toHaveTextContent('"userId": "test-user-abc-123"');

    const button = await canvas.findByTestId('sdk-context-button');
    await userEvent.click(button);

    const renderCount = await canvas.findByTestId(
      'sdk-context-render-count',
    );
    expect(renderCount).toHaveTextContent('Renders: 1');

    expect(userIdElement).toHaveTextContent('test-user-abc-123');
  },
};
