import { ContextStorePageType } from 'twenty-shared/types';

import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getInboxBrowsingContextType } from '@/ai/utils/getInboxBrowsingContextType';

describe('getInboxBrowsingContextType', () => {
  it('should read a record page from the page type', () => {
    expect(
      getInboxBrowsingContextType({
        pageType: ContextStorePageType.Record,
        viewType: null,
      }),
    ).toBe('recordPage');
  });

  it.each([ContextStoreViewType.Table, ContextStoreViewType.Kanban])(
    'should read a list view from the %s view type',
    (viewType) => {
      expect(
        getInboxBrowsingContextType({
          pageType: ContextStorePageType.Index,
          viewType,
        }),
      ).toBe('listView');
    },
  );

  it('should not read a list view from a calendar view', () => {
    expect(
      getInboxBrowsingContextType({
        pageType: ContextStorePageType.Index,
        viewType: ContextStoreViewType.Calendar,
      }),
    ).toBeNull();
  });

  it('should return nothing on a page that is neither a record nor a list', () => {
    expect(
      getInboxBrowsingContextType({
        pageType: ContextStorePageType.Settings,
        viewType: null,
      }),
    ).toBeNull();
  });
});
