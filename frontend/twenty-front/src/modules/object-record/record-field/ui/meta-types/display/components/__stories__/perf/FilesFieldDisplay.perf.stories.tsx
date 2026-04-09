import { type Meta, type StoryObj } from '@storybook/react-vite';

import { FilesDisplay } from '@/ui/field/display/components/FilesDisplay';
import { ComponentDecorator } from 'twenty-ui/testing';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { getProfilingStory } from '~/testing/profiling/utils/getProfilingStory';

const meta: Meta<typeof FilesDisplay> = {
  title: 'UI/Data/Field/Display/FilesFieldDisplay',
  decorators: [MemoryRouterDecorator, ComponentDecorator, SnackBarDecorator],
  component: FilesDisplay,
  args: {
    value: [
      {
        fileId: 'file-1',
        label: 'contract.pdf',
        extension: '.pdf',
        url: 'https://example.com/contract.pdf',
        fileCategory: 'TEXT_DOCUMENT',
      },
      {
        fileId: 'file-2',
        label: 'invoice.xlsx',
        extension: '.xlsx',
        url: 'https://example.com/invoice.xlsx',
        fileCategory: 'SPREADSHEET',
      },
      {
        fileId: 'file-3',
        label: 'logo.png',
        extension: '.png',
        url: 'https://example.com/logo.png',
        fileCategory: 'IMAGE',
      },
    ],
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof FilesDisplay>;

export const Default: Story = {};

export const Elipsis: Story = {
  parameters: {
    container: { width: 50 },
  },
};

export const Performance = getProfilingStory({
  componentName: 'FilesFieldDisplay',
  averageThresholdInMs: 0.8,
  numberOfRuns: 50,
  numberOfTestsPerRun: 100,
});
