import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

import { ToolRecordsWidget } from '@/ai/components/ToolRecordsWidget';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { WorkspaceDecorator } from '~/testing/decorators/WorkspaceDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const meta: Meta<typeof ToolRecordsWidget> = {
  title: 'Modules/AI/ToolRecordsWidget',
  component: ToolRecordsWidget,
  decorators: [
    IconsProviderDecorator,
    WorkspaceDecorator,
    ObjectMetadataItemsDecorator,
    RouterDecorator,
    ComponentDecorator,
  ],
  parameters: {
    msw: graphqlMocks,
    container: { width: 600 },
  },
};

export default meta;

type Story = StoryObj<typeof ToolRecordsWidget>;

export const FoundCompanies: Story = {
  args: {
    message: 'Found 4 company records',
    recordReferences: [
      {
        objectNameSingular: 'company',
        recordId: '20202020-a225-4b3d-a89c-7f6c30df998a',
        displayName: 'Microsoft',
      },
      {
        objectNameSingular: 'company',
        recordId: '20202020-a8b0-422c-8fcf-5b7496f94975',
        displayName: 'Meta',
      },
      {
        objectNameSingular: 'company',
        recordId: '20202020-aaf7-41d6-87a9-7add07bebfd8',
        displayName: 'SLB',
      },
      {
        objectNameSingular: 'company',
        recordId: '20202020-a305-41e7-8c72-ba44072a4c58',
        displayName: 'Google',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Found 4 company records');
    await canvas.findByText('Microsoft');

    const googleLink = await canvas.findByRole('link', { name: /Google/ });

    await expect(googleLink).toHaveAttribute(
      'href',
      '/object/company/20202020-a305-41e7-8c72-ba44072a4c58',
    );
  },
};

export const CreatedOneRecord: Story = {
  args: {
    message: 'Created 1 person record',
    recordReferences: [
      {
        objectNameSingular: 'person',
        recordId: '20202020-3ec3-4fe3-8997-b76aa0bfa408',
        displayName: 'Sylvie Palmer',
      },
    ],
  },
};

export const ManyRecordsAreTruncated: Story = {
  args: {
    message: 'Found 20 company records',
    recordReferences: Array.from({ length: 20 }, (_, index) => ({
      objectNameSingular: 'company',
      recordId: `20202020-0000-4000-8000-${String(index).padStart(12, '0')}`,
      displayName: `Company ${index + 1}`,
    })),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('and 8 more');
  },
};
