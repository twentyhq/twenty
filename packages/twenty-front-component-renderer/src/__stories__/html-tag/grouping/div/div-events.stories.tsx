import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectEventLogged } from '@/__stories__/shared/test-utils/matchers/expectEventLogged';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { expectFrontComponentValue } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentValue';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { waitForSandboxRoundTrip } from '@/__stories__/shared/test-utils/waitForSandboxRoundTrip';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HtmlTag/Grouping/Div/Events',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const ClickEvent: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await userEvent.click(subject);

    await expectFrontComponentValue({ canvas, expected: '2' });
    await expectEventLogged({ canvas, matcher: { type: 'click' } });
  },
});

export const DoubleClickEvent: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-dblclick',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.dblClick(subject);

    await expectFrontComponentValue({ canvas, expected: '1' });
    await expectEventLogged({ canvas, matcher: { type: 'dblclick' } });
  },
});

export const MouseEnterLeave: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-mouseenter-leave',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.hover(subject);
    await expectEventLogged({ canvas, matcher: { type: 'mouseenter' } });

    await userEvent.unhover(subject);
    await expectEventLogged({ canvas, matcher: { type: 'mouseleave' } });
  },
});

export const DragDrop: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-drag-drop',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');
    const dropZone = await canvas.findByTestId('drop-zone');

    subject.dispatchEvent(
      new DragEvent('dragstart', { bubbles: true, cancelable: true }),
    );
    await expectEventLogged({ canvas, matcher: { type: 'dragstart' } });

    await waitFor(() => {
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
      });
      dropZone.dispatchEvent(dragOverEvent);
      expect(dragOverEvent.defaultPrevented).toBe(true);
    });
    await expectEventLogged({ canvas, matcher: { type: 'dragover' } });

    dropZone.dispatchEvent(
      new DragEvent('drop', { bubbles: true, cancelable: true }),
    );
    await expectEventLogged({ canvas, matcher: { type: 'drop' } });
  },
});

export const FocusInOut: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-focus-in-out',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);
    await expectFrontComponentValue({ canvas, expected: 'ready' });

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);
    await expectEventLogged({ canvas, matcher: { type: 'focusin' } });

    subject.blur();
    await expectEventLogged({ canvas, matcher: { type: 'focusout' } });
  },
});

const playPropagation: NonNullable<Story['play']> = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  await expectFrontComponentMounted(canvas);

  await userEvent.click(await canvas.findByTestId('label'));
  await waitFor(() =>
    expect(canvas.getByTestId('container-click')).toHaveTextContent(
      'propagation-label in propagation-container',
    ),
  );
  await waitFor(() =>
    expect(canvas.getByTestId('document-click')).toHaveTextContent(
      'propagation-label',
    ),
  );

  await userEvent.click(canvas.getByTestId('isolated-button'));
  await waitFor(() =>
    expect(canvas.getByTestId('isolated-click-count')).toHaveTextContent('1'),
  );
  await waitForSandboxRoundTrip();
  expect(canvas.getByTestId('container-click-count')).toHaveTextContent('1');
  expect(canvas.getByTestId('document-click')).toHaveTextContent(
    'propagation-label',
  );

  await userEvent.click(canvas.getByTestId('first-field'));
  await userEvent.click(canvas.getByTestId('second-field'));
  await waitFor(() =>
    expect(canvas.getByTestId('blur-related-target')).toHaveTextContent(
      'propagation-second-field',
    ),
  );
};

export const Propagation: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-propagation',
  play: playPropagation,
});

export const PropagationPreact: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-propagation',
  runtime: 'preact',
  play: playPropagation,
});

const playCloneHandlers: NonNullable<Story['play']> = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);

  await expectFrontComponentMounted(canvas);

  const subject = await canvas.findByTestId('subject');

  await userEvent.click(subject);
  await expectFrontComponentValue({ canvas, expected: 'capture,jsx,clone' });

  await userEvent.click(subject);
  await expectFrontComponentValue({
    canvas,
    expected: 'capture,jsx,clone,capture,jsx,clone',
  });

  const saveOnce = canvas.getByTestId('save-once');

  await userEvent.click(saveOnce);
  await waitFor(() =>
    expect(canvas.getByTestId('save-count')).toHaveTextContent('1'),
  );
  await userEvent.click(saveOnce);
  await waitForSandboxRoundTrip();
  expect(canvas.getByTestId('save-count')).toHaveTextContent('1');

  await userEvent.click(canvas.getByTestId('stop-cloning'));
  await waitFor(() =>
    expect(canvas.getByTestId('clone-state')).toHaveTextContent('not cloned'),
  );
  expect(canvas.getByTestId('subject')).toBe(subject);

  await userEvent.click(subject);
  await expectFrontComponentValue({
    canvas,
    expected: 'capture,jsx,clone,capture,jsx,clone,capture,jsx',
  });
};

export const CloneHandlers: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-clone-handlers',
  play: playCloneHandlers,
});

export const CloneHandlersPreact: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-clone-handlers',
  runtime: 'preact',
  play: playCloneHandlers,
});

export const PointerMove: Story = runFrontComponentStory({
  frontComponentBundleName: 'div-pointermove',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.pointer({ target: subject, coords: { x: 10, y: 10 } });
    await userEvent.pointer({ target: subject, coords: { x: 50, y: 30 } });

    await expectEventLogged({ canvas, matcher: { type: 'pointermove' } });
    await expectEventLogged({ canvas, matcher: { type: 'mousemove' } });
  },
});
