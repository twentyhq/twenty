import { type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { expectEventLogged } from '@/__stories__/shared/test-utils/matchers/expectEventLogged';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

type Story = StoryObj<typeof FrontComponentRenderer>;

type CreateHtmlTagStoryParams = {
  frontComponentBundleName: string;
};

export const createHtmlTagClickStory = ({
  frontComponentBundleName,
}: CreateHtmlTagStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      const subject = await canvas.findByTestId('subject');

      await userEvent.click(subject);

      await expectEventLogged({ canvas, matcher: { type: 'click' } });
    },
  });

export const createHtmlTagPointerStory = ({
  frontComponentBundleName,
}: CreateHtmlTagStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      const subject = await canvas.findByTestId('subject');

      fireEvent.pointerDown(subject, { clientX: 123, clientY: 45 });

      await expectEventLogged({
        canvas,
        matcher: { type: 'pointerdown', clientX: 123, clientY: 45 },
      });

      await waitFor(() => {
        const coordinates = canvas.getByTestId('pointer-coordinates');

        expect(coordinates.textContent).toBe('123,45');
      });
    },
  });

export const createHtmlTagFocusStory = ({
  frontComponentBundleName,
}: CreateHtmlTagStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      const subject = await canvas.findByTestId('subject');

      subject.focus();

      await expectEventLogged({ canvas, matcher: { type: 'focus' } });

      subject.blur();

      await expectEventLogged({ canvas, matcher: { type: 'blur' } });
    },
  });
