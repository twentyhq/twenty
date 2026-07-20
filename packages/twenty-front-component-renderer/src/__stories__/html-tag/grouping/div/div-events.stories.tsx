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
