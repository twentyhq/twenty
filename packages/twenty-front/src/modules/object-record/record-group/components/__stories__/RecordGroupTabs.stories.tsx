import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordGroupTabs } from '@/object-record/record-group/components/RecordGroupTabs';
import { RecordGroupTabsPortalProvider } from '@/object-record/record-group/components/RecordGroupTabsPortalProvider';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import {
  RecordGroupDefinitionType,
  type RecordGroupDefinition,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { RECORD_TABLE_ROW_DND_TYPE } from '@/object-record/record-table/constants/RecordTableRowDndType';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { DragDropProvider } from '@dnd-kit/react';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewType } from '@/views/types/ViewType';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FeatureFlagKey } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RecordTableDecorator } from '~/testing/decorators/RecordTableDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

// The tab row measures its container, which would otherwise hug the tabs it renders
const StyledFullWidthContainer = styled.div`
  width: 100%;
`;

const companyView = mockedViews.find((view) => view.name === 'All Companies')!;

const RECORD_INDEX_ID = getRecordIndexIdFromObjectNamePluralAndViewId(
  'companies',
  companyView.id,
);

const RECORD_GROUPS: RecordGroupDefinition[] = [
  {
    id: 'record-group-tabs-story-contacted',
    title: 'Contacted',
    value: 'CONTACTED',
    color: 'blue',
    type: RecordGroupDefinitionType.Value,
    position: 0,
    isVisible: true,
  },
  {
    id: 'record-group-tabs-story-replied',
    title: 'Replied',
    value: 'REPLIED',
    color: 'turquoise',
    type: RecordGroupDefinitionType.Value,
    position: 1,
    isVisible: true,
  },
  {
    id: 'record-group-tabs-story-meeting',
    title: 'Meeting',
    value: 'MEETING',
    color: 'purple',
    type: RecordGroupDefinitionType.Value,
    position: 2,
    isVisible: true,
  },
];

const GROUP_COUNTS: Record<string, string> = {
  CONTACTED: '214',
  REPLIED: '41',
  MEETING: '12',
};

// The table decorator loads the mocked view asynchronously and resets this state
const seedGroupedTableState = () => {
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
    recordIndexShouldDisplayGroupsAsTabsComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    true,
  );
  jotaiStore.set(
    selectedRecordGroupTabIdComponentState.atomFamily({
      instanceId: RECORD_INDEX_ID,
    }),
    null,
  );

  for (const recordGroup of RECORD_GROUPS) {
    jotaiStore.set(
      recordGroupDefinitionFamilyState.atomFamily(recordGroup.id),
      recordGroup,
    );
    jotaiStore.set(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState.atomFamily(
        {
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          familyKey: { groupValue: recordGroup.value ?? '' },
        },
      ),
      GROUP_COUNTS[recordGroup.value ?? ''],
    );
  }

  jotaiStore.set(
    recordGroupIdsComponentState.atomFamily({ instanceId: RECORD_INDEX_ID }),
    RECORD_GROUPS.map((recordGroup) => recordGroup.id),
  );
};

const meta: Meta<typeof RecordGroupTabs> = {
  title: 'Modules/ObjectRecord/RecordGroup/RecordGroupTabs',
  component: RecordGroupTabs,
  decorators: [
    ComponentDecorator,
    MemoryRouterDecorator,
    RecordTableDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
  ],
  args: { viewType: ViewType.TABLE, dndType: RECORD_TABLE_ROW_DND_TYPE },
  render: (args) => (
    <StyledFullWidthContainer>
      <DragDropProvider>
        <RecordGroupTabsPortalProvider>
          <RecordGroupTabs {...args} />
        </RecordGroupTabsPortalProvider>
      </DragDropProvider>
    </StyledFullWidthContainer>
  ),
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordGroupTabs>;

export const SelectsAGroup: Story = {
  parameters: { container: { width: 800 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      seedGroupedTableState();
      expect(canvas.getByRole('tab', { name: /Contacted/ })).toBeVisible();
    });

    const tabs = canvas.getAllByRole('tab');
    const allTab = canvas.getByRole('tab', { name: /All/ });
    expect(tabs[tabs.length - 1]).toBe(allTab);

    const contactedTab = canvas.getByRole('tab', { name: /Contacted/ });
    expect(contactedTab).toHaveTextContent('214');
    expect(contactedTab).toHaveAttribute('aria-selected', 'true');

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
      seedGroupedTableState();
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
