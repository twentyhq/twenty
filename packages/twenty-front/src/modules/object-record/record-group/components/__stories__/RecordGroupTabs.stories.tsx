import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordGroupTabs } from '@/object-record/record-group/components/RecordGroupTabs';
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
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewType } from '@/views/types/ViewType';
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
  args: { viewType: ViewType.TABLE },
  parameters: {
    recordTableObjectNameSingular: 'company',
    msw: graphqlMocks,
  },
};

export default meta;
type Story = StoryObj<typeof RecordGroupTabs>;

export const SelectsAGroup: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      seedGroupedTableState();
      expect(canvas.getByRole('tab', { name: /Contacted/ })).toBeVisible();
    });

    const contactedTab = canvas.getByRole('tab', { name: /Contacted/ });
    expect(contactedTab).toHaveAttribute('aria-selected', 'true');
    expect(contactedTab).toHaveTextContent('214');

    const repliedTab = canvas.getByRole('tab', { name: /Replied/ });
    await userEvent.click(repliedTab);

    expect(repliedTab).toHaveAttribute('aria-selected', 'true');
    expect(contactedTab).toHaveAttribute('aria-selected', 'false');
  },
};
