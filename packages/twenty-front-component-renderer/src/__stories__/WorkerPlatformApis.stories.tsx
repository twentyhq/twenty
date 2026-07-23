import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Worker Platform APIs',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: {
    onError: errorHandler,
    applicationAccessToken: 'fake-token',
    executionContext: {
      frontComponentId: 'storybook-test',
      userId: null,
      recordId: null,
      selectedRecordIds: [],
      colorScheme: 'light',
    },
  },
  beforeEach: () => {
    errorHandler.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

// Behavior-level test: a no-op MutationObserver stub would render fine but
// never fire, so asserting the observed count catches fake implementations.
const mutationObserverTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await canvas.findByTestId(
    'mutation-observer-component',
    {},
    { timeout: 30000 },
  );

  const addButton = await canvas.findByTestId('mutation-observer-add');
  await userEvent.click(addButton);

  const count = await canvas.findByTestId('mutation-observer-count');

  await waitFor(() => {
    expect(Number(count.getAttribute('data-observed'))).toBeGreaterThan(0);
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

const createStory = (name: string, runtime?: 'preact'): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play: mutationObserverTest,
});

export const MutationObserverReact: Story = createStory(
  'mutation-observer-example',
);
export const MutationObserverPreact: Story = createStory(
  'mutation-observer-example',
  'preact',
);
