import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const errorHandler = fn();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Gallery',
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

// Every gallery fixture wraps each component in an error boundary and reports
// the aggregated result on the gallery-status element, so a single play
// function covers all submodules.
const galleryTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const status = await canvas.findByTestId(
    'gallery-status',
    {},
    { timeout: 30000 },
  );

  await waitFor(() => {
    expect(status).toHaveAttribute('data-failed-messages', '');
    expect(status).toHaveAttribute('data-failed-count', '0');
  });

  expect(Number(status.getAttribute('data-total-count'))).toBeGreaterThan(0);
  expect(errorHandler).not.toHaveBeenCalled();
};

const createGalleryStory = (name: string, runtime?: 'preact'): Story => ({
  args: {
    componentUrl: getBuiltStoryComponentPathForRender(
      `${name}.front-component`,
      runtime,
    ),
  },
  play: galleryTest,
});

export const DataDisplayReact: Story = createGalleryStory(
  'twenty-ui-data-display-gallery',
);
export const DataDisplayPreact: Story = createGalleryStory(
  'twenty-ui-data-display-gallery',
  'preact',
);

export const FeedbackReact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
);
export const FeedbackPreact: Story = createGalleryStory(
  'twenty-ui-feedback-gallery',
  'preact',
);

export const IconReact: Story = createGalleryStory('twenty-ui-icon-gallery');
export const IconPreact: Story = createGalleryStory(
  'twenty-ui-icon-gallery',
  'preact',
);

export const InputReact: Story = createGalleryStory('twenty-ui-input-gallery');
export const InputPreact: Story = createGalleryStory(
  'twenty-ui-input-gallery',
  'preact',
);

export const JsonVisualizerReact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
);
export const JsonVisualizerPreact: Story = createGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  'preact',
);

export const LayoutReact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
);
export const LayoutPreact: Story = createGalleryStory(
  'twenty-ui-layout-gallery',
  'preact',
);

export const NavigationReact: Story = createGalleryStory(
  'twenty-ui-navigation-gallery',
);
export const NavigationPreact: Story = createGalleryStory(
  'twenty-ui-navigation-gallery',
  'preact',
);

export const SurfacesReact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
);
export const SurfacesPreact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
  'preact',
);

// KNOWN ISSUE: the open Modal hangs the React-runtime sandbox render, so this
// story fails on a timeout instead of an assertion. Shorter timeout to keep
// the expected failure fast.
const modalOpenTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const status = await canvas.findByTestId(
    'gallery-status',
    {},
    { timeout: 15000 },
  );

  await waitFor(() => {
    expect(status).toHaveAttribute('data-failed-messages', '');
    expect(status).toHaveAttribute('data-failed-count', '0');
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

export const ModalOpenReact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery'),
  play: modalOpenTest,
};
export const ModalOpenPreact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery', 'preact'),
  play: modalOpenTest,
};

export const TypographyReact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
);
export const TypographyPreact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
  'preact',
);
