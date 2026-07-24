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

// KNOWN ISSUE (TDD): base-ui radio internals call MutationObserver.observe,
// shipped as an empty stub class by @remote-dom/polyfill.
const INPUT_EXPECTED_FAILURES = ['Radio', 'RadioGroup', 'CardPicker'];
export const InputReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-input-gallery',
  INPUT_EXPECTED_FAILURES,
);
export const InputPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-input-gallery',
  INPUT_EXPECTED_FAILURES,
  'preact',
);

// KNOWN ISSUE (TDD): base-ui Collapsible calls getComputedStyle, missing from
// the remote-dom Window polyfill. The runtimes diverge (observed
// deterministically): under Preact only the first Collapsible consumer
// crashes and later siblings render.
export const JsonVisualizerReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  ['JsonTree', 'JsonArrayNode', 'JsonObjectNode', 'JsonNestedNode'],
);
export const JsonVisualizerPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  ['JsonTree'],
  'preact',
);

// KNOWN ISSUE (TDD): same getComputedStyle gap through base-ui Collapsible,
// with the same React/Preact divergence.
export const LayoutReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-layout-gallery',
  ['AnimatedEaseInOut', 'AnimatedExpandableContainer'],
);
export const LayoutPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-layout-gallery',
  ['AnimatedEaseInOut'],
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

// KNOWN ISSUE (TDD): AppTooltip observes document.body with the stubbed-out
// MutationObserver.
export const SurfacesReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-surfaces-gallery',
  ['AppTooltip'],
);
export const SurfacesPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-surfaces-gallery',
  ['AppTooltip'],
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
