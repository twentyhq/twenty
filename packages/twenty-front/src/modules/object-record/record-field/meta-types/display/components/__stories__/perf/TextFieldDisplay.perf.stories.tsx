import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from 'twenty-ui';

import { TextFieldDisplay } from '@/object-record/record-field/meta-types/display/components/TextFieldDisplay';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta = {
  title: 'UI/Data/Field/Display/TextFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('person', 'city'),
    ComponentDecorator,
  ],
  component: TextFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof TextFieldDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 100 },
  },
  decorators: [
    getFieldDecorator(
      'person',
      'city',
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae rerum fugiat veniam illum accusantium saepe, voluptate inventore libero doloribus doloremque distinctio blanditiis amet quis dolor a nulla? Placeat nam itaque rerum esse quidem animi, temporibus saepe debitis commodi quia eius eos minus inventore. Voluptates fugit optio sit ab consectetur ipsum, neque eius atque blanditiis. Ullam provident at porro minima, nobis vero dicta consequatur maxime laboriosam fugit repudiandae repellat tempore voluptas non voluptatibus neque aliquam ducimus doloribus ipsa? Sapiente suscipit unde modi commodi possimus doloribus eum voluptatibus, architecto laudantium, magnam, eos numquam exercitationem est maxime explicabo odio nemo qui distinctio temporibus.',
    ),
  ],
};

export const Performance = getProfilingStory({
  componentName: 'TextFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
