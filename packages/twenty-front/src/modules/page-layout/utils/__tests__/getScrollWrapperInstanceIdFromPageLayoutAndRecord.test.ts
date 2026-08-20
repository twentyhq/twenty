import { getScrollWrapperInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getScrollWrapperInstanceIdFromPageLayoutAndRecord';
import { PageLayoutType } from '~/generated-metadata/graphql';

describe('getScrollWrapperInstanceIdFromPageLayoutAndRecord', () => {
  const getInstanceId = ({
    recordId,
    isInSidePanel = false,
  }: {
    recordId: string;
    isInSidePanel?: boolean;
  }) =>
    getScrollWrapperInstanceIdFromPageLayoutAndRecord({
      pageLayoutId: 'page-layout-id',
      layoutType: PageLayoutType.RECORD_PAGE,
      targetRecordIdentifier: {
        id: recordId,
        targetObjectNameSingular: 'company',
      },
      isInSidePanel,
      scrollWrapperArea: 'tab-content',
    });

  it('creates different instance IDs for different records', () => {
    expect(getInstanceId({ recordId: 'record-id' })).not.toBe(
      getInstanceId({ recordId: 'another-record-id' }),
    );
  });

  it('creates different instance IDs for main and side panel renderings', () => {
    expect(getInstanceId({ recordId: 'record-id' })).not.toBe(
      getInstanceId({ recordId: 'record-id', isInSidePanel: true }),
    );
  });

  it('creates different instance IDs for tab content and the left panel', () => {
    const tabContentInstanceId = getInstanceId({ recordId: 'record-id' });
    const leftPanelInstanceId =
      getScrollWrapperInstanceIdFromPageLayoutAndRecord({
        pageLayoutId: 'page-layout-id',
        layoutType: PageLayoutType.RECORD_PAGE,
        targetRecordIdentifier: {
          id: 'record-id',
          targetObjectNameSingular: 'company',
        },
        isInSidePanel: false,
        scrollWrapperArea: 'left-panel',
        pageLayoutTabId: 'pinned-tab-id',
      });

    expect(tabContentInstanceId).not.toBe(leftPanelInstanceId);
  });
});
