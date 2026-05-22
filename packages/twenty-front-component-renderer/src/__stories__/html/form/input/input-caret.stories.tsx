import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '../../../../host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '../../../shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '../../../shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '../../../shared/test-utils/runFrontComponentStory';
import {
  INTERACTION_TIMEOUT,
  TYPING_TIMEOUT,
} from '../../../shared/test-utils/timeouts';

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HTML/Form/Input/Caret',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const CaretPreservedMidString: Story = runFrontComponentStory({
  frontComponentBundleName: 'input',
  scenarioId: 'input:text:caret',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = (await canvas.findByTestId('subject')) as HTMLInputElement;

    await waitFor(
      () => {
        expect(subject.value).toBe('Hello world');
      },
      { timeout: INTERACTION_TIMEOUT },
    );

    subject.focus();
    subject.setSelectionRange(4, 4);

    await userEvent.keyboard('X');

    await waitFor(
      () => {
        expect(subject.value).toBe('HellXo world');
        expect(canvas.getByTestId('front-component-value').textContent).toBe(
          'HellXo world',
        );
        expect(subject.selectionStart).toBe(5);
        expect(subject.selectionEnd).toBe(5);
      },
      { timeout: TYPING_TIMEOUT },
    );
  },
});
