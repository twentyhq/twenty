import { type Meta, type StoryObj } from '@storybook/react-vite';

import { RecoilTextInput } from '@/ui/input/components/jotai-poc/RecoilTextInput';
import { ComponentDecorator } from 'twenty-ui/testing';
import { createState } from '@/ui/utilities/state/utils/createState';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const EXTRA_ATOMS_COUNT = 50;

const recoilInputValueState = createState<string>({
  key: 'recoilPerfTestInputValue',
  defaultValue: 'Hello World',
});

const recoilExtraStates = Array.from(
  { length: EXTRA_ATOMS_COUNT },
  (_, index) =>
    createState<string>({
      key: `recoilPerfTestExtra_${index}`,
      defaultValue: `Extra value ${index}`,
    }),
);

const RecoilTextInputWrapper = () => (
  <RecoilTextInput
    valueState={recoilInputValueState}
    extraStates={recoilExtraStates}
    placeholder="Type something..."
  />
);

const meta: Meta = {
  title: 'Performance/Input/RecoilTextInput',
  component: RecoilTextInputWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof RecoilTextInputWrapper>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'RecoilTextInput',
  averageThresholdInMs: 1,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
