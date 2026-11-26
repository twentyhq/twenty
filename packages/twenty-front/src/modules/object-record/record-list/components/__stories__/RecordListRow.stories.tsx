import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { recordIndexListPinnedFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexListPinnedFieldMetadataIdComponentState';
import { RecordList } from '@/object-record/record-list/components/RecordList';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const RecordListRowStory = () => <RecordList />;

const meta: Meta<typeof RecordListRowStory> = {
  title: 'Modules/ObjectRecord/RecordList/RecordListRow',
  component: RecordListRowStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    FileUploadDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ToastDecorator,
    ObjectMetadataItemsDecorator,
  ],
  parameters: {
    container: { height: 300, width: 800 },
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordListRowStory>;

export const ResponsiveFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const recordIdentifier = await canvas.findByText(
      mockedCompanyRecords[0].name,
      {},
      { timeout: 3000 },
    );
    await expect(getComputedStyle(recordIdentifier).fontWeight).toBe('500');

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

export const SelectsRecordsWithModifierClicks: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      mockedCompanyRecords[0].name,
      {},
      { timeout: 3000 },
    );

    const rows = canvas.getAllByRole('button', { name: 'Open record' });

    fireEvent.click(rows[0], { metaKey: true });
    fireEvent.click(rows[2], { shiftKey: true });

    await waitFor(() =>
      expect(rows[2]).toHaveAttribute('data-selected', 'true'),
    );
    await expect(rows[0]).toHaveAttribute('data-selected', 'true');
    await expect(rows[1]).toHaveAttribute('data-selected', 'true');
    await expect(rows[3]).toHaveAttribute('data-selected', 'false');
  },
};

const RELATIVE_DATE_TEXT = /^in | ago$/;
const ROW_ENDING_WITH_OVERFLOW_CHIP = /\+\d+$/;
const ROW_ENDING_WITH_RELATIVE_DATE_AFTER_OVERFLOW_CHIP =
  /\+\d+(in .+|.+ ago)$/;

const StyledWideListContainer = styled.div`
  width: 720px;
`;

export const PinnedField: Story = {
  decorators: [
    (Story) => (
      <StyledWideListContainer>
        <Story />
      </StyledWideListContainer>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(
      mockedCompanyRecords[0].name,
      {},
      { timeout: 3000 },
    );

    const rows = canvas.getAllByRole('button', { name: 'Open record' });

    await waitFor(() =>
      expect(rows[0]).toHaveTextContent(ROW_ENDING_WITH_OVERFLOW_CHIP),
    );

    const companyObjectMetadataItem =
      getTestEnrichedObjectMetadataItemsMock().find(
        (objectMetadataItem) => objectMetadataItem.nameSingular === 'company',
      )!;

    jotaiStore.set(
      recordIndexListPinnedFieldMetadataIdComponentState.atomFamily({
        instanceId: getRecordIndexIdFromObjectNamePluralAndViewId(
          companyObjectMetadataItem.namePlural,
          mockedViews.find((view) => view.name === 'All Companies')!.id,
        ),
      }),
      companyObjectMetadataItem.fields.find(
        (fieldMetadataItem) => fieldMetadataItem.name === 'createdAt',
      )!.id,
    );

    await waitFor(() =>
      expect(rows[0]).toHaveTextContent(
        ROW_ENDING_WITH_RELATIVE_DATE_AFTER_OVERFLOW_CHIP,
      ),
    );

    for (const row of rows) {
      await expect(within(row).getAllByText(RELATIVE_DATE_TEXT)).toHaveLength(
        1,
      );
    }
  },
};
