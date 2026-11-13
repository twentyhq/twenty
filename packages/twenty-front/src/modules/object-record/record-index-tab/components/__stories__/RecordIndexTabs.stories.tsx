import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordIndexTabs } from '@/object-record/record-index-tab/components/RecordIndexTabs';
import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { type ViewTab } from '@/views/types/ViewTab';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FeatureFlagKey } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FieldMetadataType, ViewTabType } from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// The tab row measures its container, which would otherwise hug the tabs it renders
const StyledFullWidthContainer = styled.div`
  width: 100%;
`;

const companyView = mockedViews.find((view) => view.name === 'All Companies')!;

const RECORD_INDEX_ID = getRecordIndexIdFromObjectNamePluralAndViewId(
  'companies',
  companyView.id,
);

const TAB_FIELD_METADATA_ITEM: FieldMetadataItem = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
    fieldName: 'name',
  }),
  type: FieldMetadataType.SELECT,
  label: 'Status',
  options: [
    {
      id: 'record-index-tabs-story-contacted',
      label: 'Contacted',
      value: 'CONTACTED',
      color: 'blue',
      position: 0,
    },
    {
      id: 'record-index-tabs-story-replied',
      label: 'Replied',
      value: 'REPLIED',
      color: 'turquoise',
      position: 1,
    },
    {
      id: 'record-index-tabs-story-meeting',
      label: 'Meeting',
      value: 'MEETING',
      color: 'purple',
      position: 2,
    },
  ],
};

// The table decorator loads the mocked view asynchronously and resets this state
const seedRecordIndexTabsState = ({
  hasTabField = true,
  viewTabs = [],
}: {
  hasTabField?: boolean;
  viewTabs?: ViewTab[];
} = {}) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED, value: true },
    ],
  });
  jotaiStore.set(
    recordIndexViewTypeState.atomFamily({ instanceId: RECORD_INDEX_ID }),
    ViewType.TABLE,
  );
  jotaiStore.set(
    recordIndexTabFieldMetadataItemComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    hasTabField ? TAB_FIELD_METADATA_ITEM : undefined,
  );
  jotaiStore.set(
    recordIndexViewTabsComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    viewTabs,
  );
  jotaiStore.set(
    selectedRecordIndexTabIdComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    null,
  );
};

const meta: Meta<typeof RecordIndexTabs> = {
  title: 'Modules/ObjectRecord/RecordIndexTab/RecordIndexTabs',
  component: RecordIndexTabs,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
  ],
  render: () => (
    <StyledFullWidthContainer>
      <RecordIndexTabs />
    </StyledFullWidthContainer>
  ),
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordIndexTabs>;

export const SelectsATab: Story = {
  parameters: { container: { width: 800 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      seedRecordIndexTabsState();
      expect(canvas.getByRole('tab', { name: /Contacted/ })).toBeVisible();
    });

    const tabs = canvas.getAllByRole('tab');
    const allTab = canvas.getByRole('tab', { name: /All/ });
    expect(tabs[tabs.length - 1]).toBe(allTab);

    expect(canvas.getByRole('tab', { name: /Contacted/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await userEvent.click(allTab);

    await waitFor(() => {
      expect(canvas.getByRole('tab', { name: /All/ })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
    expect(canvas.getByRole('tab', { name: /Contacted/ })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  },
};

export const OverflowsIntoMore: Story = {
  parameters: { container: { width: 280 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await waitFor(() => {
      seedRecordIndexTabsState();
      expect(canvas.getByTestId('tab-tab-more-button')).toBeVisible();
    });

    expect(canvas.queryByRole('tab', { name: /Meeting/ })).toBeNull();

    await userEvent.click(canvas.getByTestId('tab-tab-more-button'));
    // The hidden width measurement also renders the label, the menu comes last
    const meetingLabels = await body.findAllByText('Meeting');
    await userEvent.click(meetingLabels[meetingLabels.length - 1]);

    await waitFor(() => {
      expect(canvas.getByTestId('tab-tab-more-button')).toHaveAttribute(
        'data-active',
      );
    });
  },
};

export const PlacesAndHidesTabsFromViewTabs: Story = {
  parameters: { container: { width: 800 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      seedRecordIndexTabsState({
        viewTabs: [
          {
            id: 'record-index-tabs-story-all-row',
            type: ViewTabType.ALL,
            position: -1,
            isVisible: true,
          },
          {
            id: 'record-index-tabs-story-replied-row',
            type: ViewTabType.FIELD_VALUE,
            fieldValue: 'REPLIED',
            position: 1,
            isVisible: false,
          },
        ],
      });
      expect(canvas.getByRole('tab', { name: /All/ })).toBeVisible();
    });

    const tabs = canvas.getAllByRole('tab');
    expect(tabs[0]).toBe(canvas.getByRole('tab', { name: /All/ }));
    expect(canvas.queryByRole('tab', { name: /Replied/ })).toBeNull();
    expect(canvas.getByRole('tab', { name: /Meeting/ })).toBeVisible();
  },
};

export const ListsCustomTabs: Story = {
  parameters: { container: { width: 800 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      seedRecordIndexTabsState({
        hasTabField: false,
        viewTabs: [
          {
            id: 'record-index-tabs-story-unassigned',
            type: ViewTabType.CUSTOM,
            name: 'Unassigned',
            position: 1,
            isVisible: true,
            viewFilters: [],
          },
          {
            id: 'record-index-tabs-story-mine',
            type: ViewTabType.CUSTOM,
            name: 'Mine',
            position: 0,
            isVisible: true,
            viewFilters: [],
          },
        ],
      });
      expect(canvas.getByRole('tab', { name: /Mine/ })).toBeVisible();
    });

    const tabs = canvas.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      expect.stringContaining('Mine'),
      expect.stringContaining('Unassigned'),
      expect.stringContaining('All'),
    ]);
    expect(canvas.getByRole('tab', { name: /Mine/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};
