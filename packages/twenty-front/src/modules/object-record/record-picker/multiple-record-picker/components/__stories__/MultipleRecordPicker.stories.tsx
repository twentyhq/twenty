import { type Meta, type StoryObj } from '@storybook/react-vite';
import { HttpResponse, delay, graphql } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { MultipleRecordPickerCreationStory } from '@/object-record/record-picker/multiple-record-picker/components/__stories__/MultipleRecordPickerCreationStory';
import { initializeMultipleRecordPickerStory } from '@/object-record/record-picker/multiple-record-picker/components/__stories__/initializeMultipleRecordPickerStory';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { mockedApolloCoreClient } from '~/testing/mockedApolloCoreClient';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
import {
  type SearchQuery,
  type SearchQueryVariables,
} from '~/generated/graphql';
import { mockedCompanyRecords } from '~/testing/mock-data/generated/data/companies/mock-companies-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const COMPANY_METADATA = getMockObjectMetadataItemOrThrow('company');
const COMPANY_RECORD = mockedCompanyRecords[0];
const CREATED_COMPANY_LABEL_PATTERN = new RegExp(String(COMPANY_RECORD.name));
const CREATED_MORPH_ITEM: RecordPickerPickableMorphItem = {
  recordId: COMPANY_RECORD.id,
  objectMetadataId: COMPANY_METADATA.id,
  isSelected: true,
  isMatchingSearchFilter: true,
};
const createRecord = fn(async () => CREATED_MORPH_ITEM);
const onSearchRequest = fn<(searchInput: string) => void>();
const HIDDEN_SEARCH_QUERY = 'Hidden record search';
const ACTIVE_SEARCH_QUERY = 'Active record search';
const CLOSED_SEARCH_QUERY = 'Closed record search';
const SEARCH_SETTLE_WAIT_IN_MILLISECONDS = 750;

const meta: Meta<typeof MultipleRecordPickerCreationStory> = {
  title: 'UI/RecordPicker/MultipleRecordPicker',
  component: MultipleRecordPickerCreationStory,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
  ],
  parameters: { msw: graphqlMocks },
  args: {
    componentInstanceId: 'multiple-record-picker-creation-story',
    onCreate: createRecord,
  },
  beforeEach: ({ args }) =>
    initializeMultipleRecordPickerStory(args.componentInstanceId),
};

export default meta;
type Story = StoryObj<typeof MultipleRecordPickerCreationStory>;

export const CreateTargetAndSession: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Link records' });

    await userEvent.click(trigger);

    const picker = await body.findByRole('dialog', { name: 'Related records' });
    const search = within(picker).getByRole('searchbox');

    await userEvent.type(search, 'New company');
    await userEvent.click(
      within(picker).getByRole('button', { name: 'Add New' }),
    );

    expect(
      await within(picker).findByText('Select a record type'),
    ).toBeVisible();
    expect(within(picker).queryByRole('searchbox')).not.toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    const addNewButton = await within(picker).findByRole('button', {
      name: 'Add New',
    });

    await waitFor(() => expect(addNewButton).toHaveFocus());
    expect(search).toHaveValue('New company');
    expect(picker).toBeVisible();

    await userEvent.click(addNewButton);

    const finishCreation = fn<() => void>();
    const pendingCreation = new Promise<RecordPickerPickableMorphItem>(
      (resolve) => {
        finishCreation.mockImplementation(() => resolve(CREATED_MORPH_ITEM));
      },
    );
    createRecord.mockReturnValueOnce(pendingCreation);

    await userEvent.dblClick(
      await within(picker).findByRole('button', {
        name: COMPANY_METADATA.labelSingular,
      }),
    );

    expect(createRecord).toHaveBeenCalledTimes(1);
    expect(createRecord).toHaveBeenCalledWith({
      searchInput: 'New company',
      objectMetadataItemId: COMPANY_METADATA.id,
    });
    expect(within(picker).getByText('Select a record type')).toBeVisible();

    finishCreation();

    expect(await within(picker).findByRole('searchbox')).toHaveValue(
      'New company',
    );
    expect(
      await within(picker).findByRole('option', {
        name: CREATED_COMPANY_LABEL_PATTERN,
        selected: true,
      }),
    ).toBeVisible();
    expect(picker).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Related records' }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);

    const reopenedPicker = await body.findByRole('dialog', {
      name: 'Related records',
    });

    expect(within(reopenedPicker).getByRole('searchbox')).toHaveValue('');
    expect(
      within(reopenedPicker).getByRole('button', { name: 'Add New' }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside picker' }),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Related records' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const InactivePagesSkipSearch: Story = {
  args: {
    componentInstanceId: 'multiple-record-picker-inactive-search-story',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query<SearchQuery, SearchQueryVariables>(
          'Search',
          ({ variables }) => {
            onSearchRequest(variables.searchInput);

            return HttpResponse.json({
              data: {
                search: {
                  edges: [],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
            });
          },
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const initialTimeInMilliseconds = Date.parse(MOCKED_DATE);
    const initialPerformanceTime = performance.now();
    const originalDateNow = Date.now;
    Date.now = () =>
      initialTimeInMilliseconds +
      Math.floor(performance.now() - initialPerformanceTime);

    try {
      for (const client of [mockedApolloClient, mockedApolloCoreClient]) {
        client.cache.evict({ fieldName: 'search' });
      }
      onSearchRequest.mockClear();

      const canvas = within(canvasElement);
      const body = within(canvasElement.ownerDocument.body);

      await userEvent.click(
        await canvas.findByRole('button', { name: 'Link records' }),
      );

      const picker = await body.findByRole('dialog', {
        name: 'Related records',
      });
      const search = within(picker).getByRole('searchbox');

      await userEvent.type(search, HIDDEN_SEARCH_QUERY);
      await userEvent.click(
        within(picker).getByRole('button', { name: 'Add New' }),
      );

      expect(
        await within(picker).findByText('Select a record type'),
      ).toBeVisible();

      await delay(SEARCH_SETTLE_WAIT_IN_MILLISECONDS);

      expect(onSearchRequest).not.toHaveBeenCalledWith(HIDDEN_SEARCH_QUERY);

      await userEvent.keyboard('{Escape}');

      const restoredSearch = await within(picker).findByRole('searchbox');

      expect(restoredSearch).toHaveValue(HIDDEN_SEARCH_QUERY);

      await userEvent.clear(restoredSearch);
      await userEvent.type(restoredSearch, ACTIVE_SEARCH_QUERY);
      expect(restoredSearch).toHaveValue(ACTIVE_SEARCH_QUERY);

      await waitFor(() =>
        expect(onSearchRequest).toHaveBeenCalledWith(ACTIVE_SEARCH_QUERY),
      );

      await userEvent.clear(restoredSearch);
      await userEvent.type(restoredSearch, CLOSED_SEARCH_QUERY);
      await userEvent.keyboard('{Escape}');

      await waitFor(() =>
        expect(
          body.queryByRole('dialog', { name: 'Related records' }),
        ).not.toBeInTheDocument(),
      );
      await delay(SEARCH_SETTLE_WAIT_IN_MILLISECONDS);

      expect(onSearchRequest).not.toHaveBeenCalledWith(CLOSED_SEARCH_QUERY);
    } finally {
      Date.now = originalDateNow;
    }
  },
};
