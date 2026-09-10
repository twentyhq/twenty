import { ContextStorePageType } from 'twenty-shared/types';

import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getAiChatBrowsingContextType } from '@/ai/utils/getAiChatBrowsingContextType';

describe('getAiChatBrowsingContextType', () => {
  it('should read a record page from the page type', () => {
    expect(
      getAiChatBrowsingContextType({
        pageType: ContextStorePageType.Record,
        viewType: null,
      }),
    ).toBe('recordPage');
  });

  it.each([ContextStoreViewType.Table, ContextStoreViewType.Kanban])(
    'should read a list view from the %s view type',
    (viewType) => {
      expect(
        getAiChatBrowsingContextType({
          pageType: ContextStorePageType.Index,
          viewType,
        }),
      ).toBe('listView');
    },
  );

  it('should not read a list view from a calendar view', () => {
    expect(
      getAiChatBrowsingContextType({
        pageType: ContextStorePageType.Index,
        viewType: ContextStoreViewType.Calendar,
      }),
    ).toBeNull();
  });

  it('should return nothing on a page that is neither a record nor a list', () => {
    expect(
      getAiChatBrowsingContextType({
        pageType: ContextStorePageType.Settings,
        viewType: null,
      }),
    ).toBeNull();
  });
});
