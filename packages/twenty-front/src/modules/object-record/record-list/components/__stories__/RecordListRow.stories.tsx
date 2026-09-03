import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RecordIndexListContainer } from '@/object-record/record-index/components/RecordIndexListContainer';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';

const companyView = mockedViews.find((view) => view.name === 'All Companies')!;

const meta: Meta<typeof RecordIndexListContainer> = {
  title: 'Modules/ObjectRecord/RecordList/RecordListRow',
  component: RecordIndexListContainer,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    FileUploadDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: {
    recordListInstanceId: `companies-${companyView.id}`,
    viewBarInstanceId: 'view-bar',
  },
  parameters: {
    container: { height: 300, width: 800 },
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordIndexListContainer>;

export const ResponsiveFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const recordIdentifier = await canvas.findByText(
      mockedCompanyRecords[0].name,
      {},
      { timeout: 3000 },
    );
    const recordIdentifierChip = recordIdentifier.closest(
      '[data-testid="chip"]',
    );

    await expect(recordIdentifierChip).toHaveClass(/fontMedium/);

    const overflowChips = await canvas.findAllByRole('link', {
      name: /^\+\d+$/,
    });
    const firstOverflowChip = overflowChips[0];

    await expect(firstOverflowChip).toHaveAttribute('href');
    await expect(firstOverflowChip.getAttribute('href')).toContain(
      '/object/company/',
    );

    await userEvent.hover(within(firstOverflowChip).getByText(/^\+\d+$/));

    await body.findByRole('tooltip', {}, { timeout: 3000 });
  },
};
