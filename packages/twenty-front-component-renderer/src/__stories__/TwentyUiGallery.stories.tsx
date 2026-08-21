import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import {
  errorHandler,
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { getBuiltStoryComponentPathForRender } from '@/__stories__/utils/getBuiltStoryComponentPathForRender';
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Twenty UI Gallery',
  component: FrontComponentRenderer,
  parameters: {
    layout: 'centered',
  },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
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

// Golden known-failure test (TDD): PASSES while the documented sandbox gap
// exists — the failing component set matches the expected set EXACTLY. It
// FAILS on regression (an unexpected component starts failing), on fix
// (nothing fails anymore) and on partial fix (only some expected components
// still fail): when your fix lands, flip the story back to the strict
// zero-failure `createGalleryStory` play.
const createKnownFailureGalleryTest =
  (expectedFailedComponents: string[]): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const status = await canvas.findByTestId(
      'gallery-status',
      {},
      { timeout: 30000 },
    );

    const expectedFailedComponentsSorted = [...expectedFailedComponents].sort();

    // Failure reports arrive asynchronously: retry until the failed set
    // matches the expected set exactly.
    await waitFor(() => {
      const failedComponents = (status.getAttribute('data-failed-names') ?? '')
        .split(', ')
        .filter((failedComponent) => failedComponent.length > 0)
        .sort();

      expect(failedComponents).toEqual(expectedFailedComponentsSorted);
    });

    expect(errorHandler).not.toHaveBeenCalled();
  };

const createKnownFailureGalleryStory = (
  name: string,
  expectedFailedComponents: string[],
  runtime?: 'preact',
): Story => ({
  ...createGalleryStory(name, runtime),
  play: createKnownFailureGalleryTest(expectedFailedComponents),
});

// KNOWN ISSUE (TDD): LinkChip crashes without a router context in the sandbox.
export const DataDisplayReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  ['LinkChip'],
);
export const DataDisplayPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  ['LinkChip'],
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

// KNOWN ISSUE (TDD): react-router Links crash without a router context.
const NAVIGATION_EXPECTED_FAILURES = ['RawLink', 'UndecoratedLink'];
export const NavigationReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-navigation-gallery',
  NAVIGATION_EXPECTED_FAILURES,
);
export const NavigationPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-navigation-gallery',
  NAVIGATION_EXPECTED_FAILURES,
  'preact',
);

export const SurfacesReact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
);
export const SurfacesPreact: Story = createGalleryStory(
  'twenty-ui-surfaces-gallery',
  'preact',
);

// KNOWN ISSUE (TDD) golden test: an open Modal (base-ui Dialog portal) hangs
// the React-runtime render — the gallery status must never mount. Works under
// Preact (see ModalOpenPreact). When fixed, flip this story to the strict
// zero-failure play used by ModalOpenPreact.
const modalOpenHangTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  await expect(
    canvas.findByTestId('gallery-status', {}, { timeout: 10000 }),
  ).rejects.toThrow();
};

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
  play: modalOpenHangTest,
};
export const ModalOpenPreact: Story = {
  ...createGalleryStory('twenty-ui-modal-open-gallery', 'preact'),
  play: modalOpenTest,
};

// KNOWN ISSUE (TDD) golden test: monaco cannot load inside the sandbox worker
// (no script loading in the polyfilled DOM, opaque-origin CSP): the CodeEditor
// wrapper mounts but monaco's onMount never fires. If front components ever
// get a supported code editor path, flip the assertion to 'mounted'.
const codeEditorTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const codeEditor = await canvas.findByTestId(
    'code-editor-component',
    {},
    { timeout: 30000 },
  );

  await new Promise((resolve) => setTimeout(resolve, 5000));

  expect(codeEditor).toHaveAttribute('data-monaco-mount-state', 'pending');
};

export const CodeEditorReact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery'),
  play: codeEditorTest,
};
export const CodeEditorPreact: Story = {
  ...createGalleryStory('twenty-ui-code-editor-gallery', 'preact'),
  play: codeEditorTest,
};

export const TypographyReact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
);
export const TypographyPreact: Story = createGalleryStory(
  'twenty-ui-typography-gallery',
  'preact',
);

const themeTokenTest: Story['play'] = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const iconWrapper = await canvas.findByTestId(
    'theme-token-icon-wrapper',
    {},
    { timeout: 30000 },
  );

  await waitFor(() => {
    const iconBox = iconWrapper.getBoundingClientRect();

    expect(Math.round(iconBox.width)).toBe(16);
    expect(Math.round(iconBox.height)).toBe(16);
  });

  expect(errorHandler).not.toHaveBeenCalled();
};

export const ThemeTokensReact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens'),
  play: themeTokenTest,
};
export const ThemeTokensPreact: Story = {
  ...createGalleryStory('twenty-ui-theme-tokens', 'preact'),
  play: themeTokenTest,
};
