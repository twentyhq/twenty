import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('getTabListInstanceIdFromPageLayoutAndRecord', () => {
  it('should include record ID for RECORD_PAGE layout with targetRecordIdentifier', () => {
    const result = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: 'layout-1',
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: {
        id: 'record-42',
        targetObjectNameSingular: 'company',
      },
    });

    expect(result).toBe('layout-1-tab-list-record-42');
  });

  it('should omit record ID for DASHBOARD layout', () => {
    const result = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: 'layout-1',
      layoutType: PageLayoutType.DASHBOARD,
      targetRecordIdentifier: {
        id: 'record-42',
        targetObjectNameSingular: 'company',
      },
    });

    expect(result).toBe('layout-1-tab-list');
  });

  it('should omit record ID when targetRecordIdentifier is undefined', () => {
    const result = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: 'layout-1',
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: undefined,
    });

    expect(result).toBe('layout-1-tab-list');
  });

  it('should use the base instance ID from getTabListInstanceIdFromPageLayoutId', () => {
    const result = getTabListInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: 'my-custom-layout',
      layoutType: PageLayoutType.DASHBOARD,
    });

    expect(result).toBe('my-custom-layout-tab-list');
  });
});
