import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { type ReactNode } from 'react';

import { JotaiTextInput } from '@/ui/input/components/jotai-poc/JotaiTextInput';
import { ComponentDecorator } from 'twenty-ui/testing';
import { createState as createJotaiState } from 'twenty-ui/utilities';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const EXTRA_ATOMS_COUNT = 50;

const jotaiInputValueState = createJotaiState<string>({
  key: 'jotaiPerfTestInputValue',
  defaultValue: 'Hello World',
});

const jotaiExtraAtoms = Array.from({ length: EXTRA_ATOMS_COUNT }, (_, index) =>
  createJotaiState<string>({
    key: `jotaiPerfTestExtra_${index}`,
    defaultValue: `Extra value ${index}`,
  }),
);

const HydrateAtoms = ({ children }: { children: ReactNode }) => {
  useHydrateAtoms([
    [jotaiInputValueState, 'Hello World'] as const,
    ...jotaiExtraAtoms.map((extraAtom, index) => {
      return [extraAtom, `Extra value ${index}`] as const;
    }),
  ]);
  return children;
};

const JotaiTextInputWrapper = () => (
  <Provider>
    <HydrateAtoms>
      <JotaiTextInput
        atom={jotaiInputValueState}
        extraAtoms={jotaiExtraAtoms}
        placeholder="Type something..."
      />
    </HydrateAtoms>
  </Provider>
);

const meta: Meta = {
  title: 'Performance/Input/JotaiTextInput',
  component: JotaiTextInputWrapper,
  decorators: [ComponentDecorator],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof JotaiTextInputWrapper>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'JotaiTextInput',
  averageThresholdInMs: 1,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
