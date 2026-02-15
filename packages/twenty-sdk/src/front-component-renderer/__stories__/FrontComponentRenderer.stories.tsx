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

// Generates a story that renders a built front-component bundle
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

// ---------------------------------------------------------------------------
// React stories
// ---------------------------------------------------------------------------

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

export const ChakraExample = createComponentStory('chakra-example');
export const TailwindExample = createComponentStory('tailwind-example');
export const EmotionExample = createComponentStory('emotion-example');
export const StyledComponentsExample = createComponentStory(
  'styled-components-example',
);
export const ShadcnExample = createComponentStory('shadcn-example');
export const MuiExample = createComponentStory('mui-example');
export const TwentyUiExample = createComponentStory('twenty-ui-example');

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

// ---------------------------------------------------------------------------
// Preact stories — same source components, built with preact/compat
// ---------------------------------------------------------------------------

export const PreactStatic = createComponentStory('static', {
  runtime: 'preact',
  play: Static.play,
});
export const PreactInteractive = createComponentStory('interactive', {
  runtime: 'preact',
  play: Interactive.play,
});
export const PreactLifecycle = createComponentStory('lifecycle', {
  runtime: 'preact',
  play: Lifecycle.play,
});
export const PreactChakraExample = createComponentStory('chakra-example', {
  runtime: 'preact',
});
export const PreactTailwindExample = createComponentStory('tailwind-example', {
  runtime: 'preact',
});
export const PreactEmotionExample = createComponentStory('emotion-example', {
  runtime: 'preact',
});
export const PreactStyledComponentsExample = createComponentStory(
  'styled-components-example',
  { runtime: 'preact' },
);
export const PreactShadcnExample = createComponentStory('shadcn-example', {
  runtime: 'preact',
});
export const PreactMuiExample = createComponentStory('mui-example', {
  runtime: 'preact',
});
export const PreactTwentyUiExample = createComponentStory(
  'twenty-ui-example',
  { runtime: 'preact' },
);
