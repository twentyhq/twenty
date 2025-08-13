import { type Meta, type StoryObj } from '@storybook/react';
import { useContext, useEffect } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/ui/contexts/FieldFocusContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { LinksFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/LinksFieldDisplay';
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
  title: 'UI/Data/Field/Display/LinksFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'domainName', {
      primaryLinkUrl: 'https://www.google.com',
      primaryLinkLabel: 'Google',
      secondaryLinks: ['https://www.toto.com'],
    }),
    ComponentDecorator,
  ],
  component: LinksFieldDisplay,
  args: {},
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof LinksFieldDisplay>;

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
    container: { width: 100 },
  },
};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'LinksFieldDisplay',
  averageThresholdInMs: 0.5,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
