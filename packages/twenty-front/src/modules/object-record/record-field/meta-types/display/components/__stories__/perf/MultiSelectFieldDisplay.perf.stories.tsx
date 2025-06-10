import { Meta, StoryObj } from '@storybook/react';
import { useContext, useEffect } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/contexts/FieldFocusContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { MultiSelectFieldDisplay } from '@/object-record/record-field/meta-types/display/components/MultiSelectFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { ComponentDecorator } from 'twenty-ui/testing';

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
