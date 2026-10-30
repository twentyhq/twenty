import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useContext, useEffect } from 'react';

import { FieldFocusContext } from '@/object-record/record-field/ui/contexts/FieldFocusContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { MultiSelectFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/MultiSelectFieldDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { getFieldDecorator } from '~/testing/decorators/getFieldDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';
import { MultiSelectFieldDisplayUpdatesExample } from './MultiSelectFieldDisplayUpdatesExample';

const OVERFLOW_TRIGGER_NAME_PATTERN = /Show all items$/;

const FieldFocusEffect = () => {
  const { setIsFocused } = useContext(FieldFocusContext);

  useEffect(() => {
    setIsFocused(true);
  }, [setIsFocused]);

  return null;
};

const meta: Meta = {
  title: 'UI/Data/Field/Display/MultiSelectFieldDisplay',
  decorators: [
    MemoryRouterDecorator,
    getFieldDecorator('company', 'workPolicy', [
      'ON_SITE',
      'HYBRID',
      'REMOTE_WORK',
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

export const OverflowingList: Story = {
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
  averageThresholdInMs: 0.4,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});

export const Updates: Story = {
  render: () => (
    <FieldFocusContextProvider>
      <MultiSelectFieldDisplayUpdatesExample />
    </FieldFocusContextProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByText('On-Site')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: OVERFLOW_TRIGGER_NAME_PATTERN }),
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show hybrid option' }),
    );
    await waitFor(async () => {
      await expect(canvas.getByText('Hybrid')).toBeVisible();
      await expect(canvas.queryByText('On-Site')).toBeNull();
      await expect(canvas.queryByText('Remote Work')).toBeNull();
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Update option labels' }),
    );
    await expect(await canvas.findByText('Updated Hybrid')).toBeVisible();
    await expect(canvas.queryByText('Hybrid')).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Show all options' }),
    );
    await expect(await canvas.findByText('Updated On-Site')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: OVERFLOW_TRIGGER_NAME_PATTERN }),
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable overflow' }),
    );
    const trigger = await canvas.findByRole('button', {
      name: '+2 Show all items',
    });
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', {
      name: 'Show all items',
    });
    await expect(within(popup).getByText('Updated Hybrid')).toBeVisible();
    await expect(within(popup).getByText('Updated Remote Work')).toBeVisible();
    await expect(within(popup).getByText('Updated On-Site')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable overflow' }),
    );
    await waitFor(async () => {
      await expect(
        body.queryByRole('dialog', { name: 'Show all items' }),
      ).toBeNull();
      await expect(
        canvas.queryByRole('button', { name: OVERFLOW_TRIGGER_NAME_PATTERN }),
      ).toBeNull();
    });
  },
};
