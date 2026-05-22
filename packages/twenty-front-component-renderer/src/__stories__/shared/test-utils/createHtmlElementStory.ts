import { type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { type FrontComponentRenderer } from '../../../host/components/FrontComponentRenderer';

import { expectEventLogged } from './matchers/expectEventLogged';
import { expectFrontComponentMounted } from './matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from './runFrontComponentStory';

type Story = StoryObj<typeof FrontComponentRenderer>;

type CreateHtmlTagStoryParams = {
  frontComponentBundleName: string;
  tag: string;
};

export const createHtmlTagClickStory = ({
  frontComponentBundleName,
  tag,
}: CreateHtmlTagStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    scenarioId: `${tag}:click`,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectFrontComponentMounted(canvas);

      const subject = await canvas.findByTestId('subject');

      await userEvent.click(subject);

      await expectEventLogged({ canvas, matcher: { type: 'click' } });
    },
  });

export const createHtmlTagFocusStory = ({
  frontComponentBundleName,
  tag,
}: CreateHtmlTagStoryParams): Story =>
  runFrontComponentStory({
    frontComponentBundleName,
    scenarioId: `${tag}:focus-blur`,
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
