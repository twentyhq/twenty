import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FrontComponentRenderer } from '../host/components/FrontComponentRenderer';

import { getBuiltStoryComponentPathForRender } from './utils/getBuiltStoryComponentPathForRender';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/UI Libraries',
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

// Shared play function that tests the counter increment for every UI library.
// Each component must expose data-testid="<prefix>-count" (text "Count: N")
// and data-testid="<prefix>-button" (the increment button).
const createCounterTest =
  (testIdPrefix: string): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByTestId(
      `${testIdPrefix}-component`,
      {},
      { timeout: 30000 },
    );

    expect(await canvas.findByText('Count: 0')).toBeVisible();

    const button = await canvas.findByTestId(`${testIdPrefix}-button`);
    await userEvent.click(button);
    expect(await canvas.findByText('Count: 1')).toBeVisible();

    await userEvent.click(button);
    expect(await canvas.findByText('Count: 2')).toBeVisible();
  };

// ---------------------------------------------------------------------------
// Chakra UI
// ---------------------------------------------------------------------------

const chakraTest = createCounterTest('chakra');

export const ChakraReact: Story = createComponentStory('chakra-example', {
  play: chakraTest,
});
export const ChakraPreact: Story = createComponentStory('chakra-example', {
  runtime: 'preact',
  play: chakraTest,
});

// ---------------------------------------------------------------------------
// Tailwind CSS
// ---------------------------------------------------------------------------

const tailwindTest = createCounterTest('tailwind');

export const TailwindReact: Story = createComponentStory('tailwind-example', {
  play: tailwindTest,
});
export const TailwindPreact: Story = createComponentStory('tailwind-example', {
  runtime: 'preact',
  play: tailwindTest,
});

// ---------------------------------------------------------------------------
// Emotion
// ---------------------------------------------------------------------------

const emotionTest = createCounterTest('emotion');

export const EmotionReact: Story = createComponentStory('emotion-example', {
  play: emotionTest,
});
export const EmotionPreact: Story = createComponentStory('emotion-example', {
  runtime: 'preact',
  play: emotionTest,
});

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const styledComponentsTest = createCounterTest('styled-components');

export const StyledComponentsReact: Story = createComponentStory(
  'styled-components-example',
  { play: styledComponentsTest },
);
export const StyledComponentsPreact: Story = createComponentStory(
  'styled-components-example',
  { runtime: 'preact', play: styledComponentsTest },
);

// ---------------------------------------------------------------------------
// shadcn UI
// ---------------------------------------------------------------------------

const shadcnTest = createCounterTest('shadcn');

export const ShadcnReact: Story = createComponentStory('shadcn-example', {
  play: shadcnTest,
});
export const ShadcnPreact: Story = createComponentStory('shadcn-example', {
  runtime: 'preact',
  play: shadcnTest,
});

// ---------------------------------------------------------------------------
// MUI (Material UI)
// ---------------------------------------------------------------------------

const muiTest = createCounterTest('mui');

export const MuiReact: Story = createComponentStory('mui-example', {
  play: muiTest,
});
export const MuiPreact: Story = createComponentStory('mui-example', {
  runtime: 'preact',
  play: muiTest,
});

// ---------------------------------------------------------------------------
// Twenty UI
// ---------------------------------------------------------------------------

const twentyUiTest = createCounterTest('twenty-ui');

export const TwentyUiReact: Story = createComponentStory('twenty-ui-example', {
  play: twentyUiTest,
});
export const TwentyUiPreact: Story = createComponentStory(
  'twenty-ui-example',
  { runtime: 'preact', play: twentyUiTest },
);
