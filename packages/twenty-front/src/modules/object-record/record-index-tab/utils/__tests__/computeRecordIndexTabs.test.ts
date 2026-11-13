import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { RECORD_INDEX_NO_VALUE_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexNoValueTabId';
import { computeRecordIndexTabs } from '@/object-record/record-index-tab/utils/computeRecordIndexTabs';
import { type ViewTab } from '@/views/types/ViewTab';
import { ViewTabType } from '~/generated-metadata/graphql';

const STAGE_FIELD_METADATA_ITEM = {
  options: [
    {
      id: 'meeting-option',
      label: 'Meeting',
      value: 'MEETING',
      color: 'purple' as const,
      position: 1,
    },
    {
      id: 'new-option',
      label: 'New',
      value: 'NEW',
      color: 'red' as const,
      position: 0,
    },
    {
      id: 'customer-option',
      label: 'Customer',
      value: 'CUSTOMER',
      color: 'green' as const,
      position: 2,
    },
  ],
};

const buildViewTab = (
  viewTab: Partial<ViewTab> & Pick<ViewTab, 'id' | 'type'>,
) => ({
  position: 0,
  isVisible: true,
  ...viewTab,
});

describe('computeRecordIndexTabs', () => {
  it('should list options in option order, then No value, then All', () => {
    const recordIndexTabs = computeRecordIndexTabs({
      recordIndexTabFieldMetadataItem: STAGE_FIELD_METADATA_ITEM,
      viewTabs: [],
    });

    expect(recordIndexTabs.map(({ id }) => id)).toEqual([
      'NEW',
      'MEETING',
      'CUSTOMER',
      RECORD_INDEX_NO_VALUE_TAB_ID,
      RECORD_INDEX_ALL_TAB_ID,
    ]);
    expect(recordIndexTabs.every(({ isVisible }) => isVisible)).toBe(true);
    expect(recordIndexTabs[0]).toEqual({
      id: 'NEW',
      kind: 'option',
      label: 'New',
      color: 'red',
      viewTabId: undefined,
      isVisible: true,
      position: 0,
    });
  });

  it('should apply the place and visibility of stored rows', () => {
    const recordIndexTabs = computeRecordIndexTabs({
      recordIndexTabFieldMetadataItem: STAGE_FIELD_METADATA_ITEM,
      viewTabs: [
        buildViewTab({
          id: 'all-row',
          type: ViewTabType.ALL,
          position: -1,
        }),
        buildViewTab({
          id: 'customer-row',
          type: ViewTabType.FIELD_VALUE,
          fieldValue: 'CUSTOMER',
          position: 2,
          isVisible: false,
        }),
      ],
    });

    expect(recordIndexTabs.map(({ id }) => id)).toEqual([
      RECORD_INDEX_ALL_TAB_ID,
      'NEW',
      'MEETING',
      'CUSTOMER',
      RECORD_INDEX_NO_VALUE_TAB_ID,
    ]);
    expect(recordIndexTabs[0].viewTabId).toBe('all-row');
    expect(recordIndexTabs.find(({ id }) => id === 'CUSTOMER')?.isVisible).toBe(
      false,
    );
  });

  it('should ignore custom tabs while a tab field is set', () => {
    const recordIndexTabs = computeRecordIndexTabs({
      recordIndexTabFieldMetadataItem: STAGE_FIELD_METADATA_ITEM,
      viewTabs: [
        buildViewTab({ id: 'mine', type: ViewTabType.CUSTOM, name: 'Mine' }),
      ],
    });

    expect(recordIndexTabs.some(({ kind }) => kind === 'custom')).toBe(false);
  });

  it('should list custom tabs by position with All last by default', () => {
    const recordIndexTabs = computeRecordIndexTabs({
      recordIndexTabFieldMetadataItem: undefined,
      viewTabs: [
        buildViewTab({
          id: 'unassigned',
          type: ViewTabType.CUSTOM,
          name: 'Unassigned',
          position: 1,
        }),
        buildViewTab({
          id: 'mine',
          type: ViewTabType.CUSTOM,
          name: 'Mine',
          position: 0,
        }),
      ],
    });

    expect(
      recordIndexTabs.map(({ id, kind, label }) => ({ id, kind, label })),
    ).toEqual([
      { id: 'mine', kind: 'custom', label: 'Mine' },
      { id: 'unassigned', kind: 'custom', label: 'Unassigned' },
      { id: RECORD_INDEX_ALL_TAB_ID, kind: 'all', label: '' },
    ]);
  });

  it('should show only All in custom mode before any custom tab exists', () => {
    expect(
      computeRecordIndexTabs({
        recordIndexTabFieldMetadataItem: undefined,
        viewTabs: [buildViewTab({ id: 'all-row', type: ViewTabType.ALL })],
      }).map(({ id }) => id),
    ).toEqual([RECORD_INDEX_ALL_TAB_ID]);
  });

  it('should have no tabs without a tab field or stored tab', () => {
    expect(
      computeRecordIndexTabs({
        recordIndexTabFieldMetadataItem: undefined,
        viewTabs: [],
      }),
    ).toEqual([]);
  });
});
