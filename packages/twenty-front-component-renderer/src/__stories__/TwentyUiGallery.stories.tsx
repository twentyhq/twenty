import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { type FailedGalleryEntry } from '@/__stories__/shared/front-components/component-gallery';
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

type ExpectedGalleryFailure = {
  name: string;
  messageIncludes: string;
};

// Stable substrings of the documented sandbox errors: short enough to survive
// minified receiver names and engine wording differences, specific enough that
// the same component failing for a NEW reason no longer passes as the known
// issue.
const MUTATION_OBSERVER_STUB_ERROR = 'observe is not a function';
const GET_COMPUTED_STYLE_MISSING_ERROR = 'getComputedStyle';
// react-router Link destructures `basename` from the absent NavigationContext.
const MISSING_ROUTER_CONTEXT_ERROR = 'basename';

// Golden known-failure test (TDD): PASSES while the documented sandbox gap
// exists — some components fail, every failing component belongs to the
// expected set, and each failure message matches the documented cause. It
// FAILS on regression (an unexpected component starts failing, or an expected
// one starts failing for a different reason) and on fix (nothing fails
// anymore): when your fix lands, flip the story back to the strict
// zero-failure `createGalleryStory` play.
const createKnownFailureGalleryTest =
  (expectedFailures: ExpectedGalleryFailure[]): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const status = await canvas.findByTestId(
      'gallery-status',
      {},
      { timeout: 30000 },
    );

    await waitFor(() => {
      expect(Number(status.getAttribute('data-failed-count'))).toBeGreaterThan(
        0,
      );
    });

    const failedEntries = JSON.parse(
      status.getAttribute('data-failed-entries') ?? '[]',
    ) as FailedGalleryEntry[];

    for (const failedEntry of failedEntries) {
      const expectedFailure = expectedFailures.find(
        (failure) => failure.name === failedEntry.name,
      );

      if (!isDefined(expectedFailure)) {
        throw new Error(
          `Unexpected failing component ${failedEntry.name}: ${failedEntry.message}`,
        );
      }

      expect(failedEntry.message).toContain(expectedFailure.messageIncludes);
    }

    expect(errorHandler).not.toHaveBeenCalled();
  };

const createKnownFailureGalleryStory = (
  name: string,
  expectedFailures: ExpectedGalleryFailure[],
  runtime?: 'preact',
): Story => ({
  ...createGalleryStory(name, runtime),
  play: createKnownFailureGalleryTest(expectedFailures),
});

// KNOWN ISSUE (TDD): LinkChip crashes without a router context in the sandbox.
const DATA_DISPLAY_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  { name: 'LinkChip', messageIncludes: MISSING_ROUTER_CONTEXT_ERROR },
];
export const DataDisplayReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  DATA_DISPLAY_EXPECTED_FAILURES,
);
export const DataDisplayPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-data-display-gallery',
  DATA_DISPLAY_EXPECTED_FAILURES,
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
const INPUT_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  { name: 'Radio', messageIncludes: MUTATION_OBSERVER_STUB_ERROR },
  { name: 'RadioGroup', messageIncludes: MUTATION_OBSERVER_STUB_ERROR },
  { name: 'CardPicker', messageIncludes: MUTATION_OBSERVER_STUB_ERROR },
];
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
// the remote-dom Window polyfill.
const JSON_VISUALIZER_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  { name: 'JsonTree', messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR },
  { name: 'JsonArrayNode', messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR },
  { name: 'JsonObjectNode', messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR },
  { name: 'JsonNestedNode', messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR },
];
export const JsonVisualizerReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  JSON_VISUALIZER_EXPECTED_FAILURES,
);
export const JsonVisualizerPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-json-visualizer-gallery',
  JSON_VISUALIZER_EXPECTED_FAILURES,
  'preact',
);

// KNOWN ISSUE (TDD): same getComputedStyle gap through base-ui Collapsible.
const LAYOUT_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  {
    name: 'AnimatedEaseInOut',
    messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR,
  },
  {
    name: 'AnimatedExpandableContainer',
    messageIncludes: GET_COMPUTED_STYLE_MISSING_ERROR,
  },
];
export const LayoutReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-layout-gallery',
  LAYOUT_EXPECTED_FAILURES,
);
export const LayoutPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-layout-gallery',
  LAYOUT_EXPECTED_FAILURES,
  'preact',
);

// KNOWN ISSUE (TDD): react-router Links crash without a router context.
const NAVIGATION_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  { name: 'RawLink', messageIncludes: MISSING_ROUTER_CONTEXT_ERROR },
  { name: 'UndecoratedLink', messageIncludes: MISSING_ROUTER_CONTEXT_ERROR },
];
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
const SURFACES_EXPECTED_FAILURES: ExpectedGalleryFailure[] = [
  { name: 'AppTooltip', messageIncludes: MUTATION_OBSERVER_STUB_ERROR },
];
export const SurfacesReact: Story = createKnownFailureGalleryStory(
  'twenty-ui-surfaces-gallery',
  SURFACES_EXPECTED_FAILURES,
);
export const SurfacesPreact: Story = createKnownFailureGalleryStory(
  'twenty-ui-surfaces-gallery',
  SURFACES_EXPECTED_FAILURES,
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
