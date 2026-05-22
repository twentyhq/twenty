import { type StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';

import { type FrontComponentRenderer } from '../../host/components/FrontComponentRenderer';

import { expectEventLogged } from './matchers/expectEventLogged';
import { expectProbeReady } from './matchers/expectProbeReady';
import { runProbeStory } from './runProbeStory';

type Story = StoryObj<typeof FrontComponentRenderer>;

export const createBaselineClickStory = (elementName: string): Story =>
  runProbeStory({
    probe: 'baseline',
    scenarioId: `baseline:${elementName}:click`,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectProbeReady(canvas);

      const subject = await canvas.findByTestId('subject');

      await userEvent.click(subject);

      await expectEventLogged({ canvas, matcher: { type: 'click' } });
    },
  });

export const createBaselineFocusStory = (elementName: string): Story =>
  runProbeStory({
    probe: 'baseline',
    scenarioId: `baseline:${elementName}:focus-blur`,
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);

      await expectProbeReady(canvas);

      const subject = await canvas.findByTestId('subject');

      subject.focus();

      await expectEventLogged({ canvas, matcher: { type: 'focus' } });

      subject.blur();

      await expectEventLogged({ canvas, matcher: { type: 'blur' } });
    },
  });
