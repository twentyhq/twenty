import { type Meta, type StoryObj } from '@storybook/react';
import { useContext, useEffect } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/ui/contexts/FieldFocusContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { MultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MultiSelectFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const FieldFocusEffect = () => {
  const { setIsFocused } = useContext(FieldFocusContext);

  useEffect(() => {
    setIsFocused(true);
  }, [setIsFocused]);

  return <></>;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/MultiSelectFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'workPolicy', [
      'Option 1',
      'Option 2',
      'Option 3',
    ]),
    ComponentDecorator,
  ],
  component: MultiSelectFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof MultiSelectFieldDisplay>;

export const Default: Story = {};

export const ExpandableList: Story = {
  decorators: [
    (Story) => {
      return (
        <FieldFocusContextProvider>
          <FieldFocusEffect />
          <Story />
        </FieldFocusContextProvider>
      );
    },
  ],
  parameters: {
    container: { width: 130 },
  },
};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'MultiSelectFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
