import { getPageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/utils/getPageLayoutSidePanelTarget';

describe('getPageLayoutSidePanelTarget', () => {
  it('should return the object and record when exactly one record is selected', () => {
    expect(
      getPageLayoutSidePanelTarget({
        contextStoreCurrentObjectMetadataItemId: 'dashboard-object-id',
        contextStoreTargetedRecordsRule: {
          mode: 'selection',
          selectedRecordIds: ['dashboard-record-id'],
        },
      }),
    ).toEqual({
      objectMetadataItemId: 'dashboard-object-id',
      recordId: 'dashboard-record-id',
    });
  });

  it('should return null once leaving the page has cleared the selection', () => {
    expect(
      getPageLayoutSidePanelTarget({
        contextStoreCurrentObjectMetadataItemId: 'company-object-id',
        contextStoreTargetedRecordsRule: {
          mode: 'selection',
          selectedRecordIds: [],
        },
      }),
    ).toBeNull();
  });

  it('should return null when several records are selected', () => {
    expect(
      getPageLayoutSidePanelTarget({
        contextStoreCurrentObjectMetadataItemId: 'company-object-id',
        contextStoreTargetedRecordsRule: {
          mode: 'selection',
          selectedRecordIds: ['first-record-id', 'second-record-id'],
        },
      }),
    ).toBeNull();
  });

  it('should return null in exclusion mode', () => {
    expect(
      getPageLayoutSidePanelTarget({
        contextStoreCurrentObjectMetadataItemId: 'company-object-id',
        contextStoreTargetedRecordsRule: {
          mode: 'exclusion',
          excludedRecordIds: [],
        },
      }),
    ).toBeNull();
  });

  it('should return null without a current object', () => {
    expect(
      getPageLayoutSidePanelTarget({
        contextStoreCurrentObjectMetadataItemId: undefined,
        contextStoreTargetedRecordsRule: {
          mode: 'selection',
          selectedRecordIds: ['dashboard-record-id'],
        },
      }),
    ).toBeNull();
  });
});
