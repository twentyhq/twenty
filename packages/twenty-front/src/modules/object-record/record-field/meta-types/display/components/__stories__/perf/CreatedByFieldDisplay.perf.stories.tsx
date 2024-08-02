import { CreatedByFieldDisplay } from '@/object-record/record-field/meta-types/display/components/CreatedByFieldDisplay';
import { FieldCreatedByValue } from '@/object-record/record-field/types/FieldMetadata';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/CreatedByFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    ChipGeneratorsDecorator,
    getFieldDecorator('person', 'createdBy', {
      name: 'John Doe',
      source: 'API',
      workspaceMemberId: undefined,
    } satisfies FieldCreatedByValue),
    ComponentDecorator,
  ],
  component: CreatedByFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof CreatedByFieldDisplay>;

export const Default: Story = {};

export const Performance = getProfilingStory({
  componentName: 'CreatedByFieldDisplay',
  averageThresholdInMs: 0.2,
  numberOfRuns: 20,
  numberOfTestsPerRun: 100,
});
