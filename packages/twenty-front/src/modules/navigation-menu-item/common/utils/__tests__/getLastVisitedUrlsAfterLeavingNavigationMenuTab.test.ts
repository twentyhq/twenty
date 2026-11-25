import { getLastVisitedUrlsAfterLeavingNavigationMenuTab } from '@/navigation-menu-item/common/utils/getLastVisitedUrlsAfterLeavingNavigationMenuTab';

describe('getLastVisitedUrlsAfterLeavingNavigationMenuTab', () => {
  const lastVisitedUrls = { 'chats-tab-id': '/inbox' };

  it('remembers the current page for the tab that holds it', () => {
    expect(
      getLastVisitedUrlsAfterLeavingNavigationMenuTab({
        lastVisitedUrls,
        leftTabId: 'chats-tab-id',
        tabIdHoldingCurrentPage: 'chats-tab-id',
        currentUrl: '/chat/thread-id',
      }),
    ).toEqual({ 'chats-tab-id': '/chat/thread-id' });
  });

  it('remembers the current page for Home under the home key', () => {
    expect(
      getLastVisitedUrlsAfterLeavingNavigationMenuTab({
        lastVisitedUrls,
        leftTabId: null,
        tabIdHoldingCurrentPage: null,
        currentUrl: '/objects/people',
      }),
    ).toEqual({ 'chats-tab-id': '/inbox', home: '/objects/people' });
  });

  it.each([
    { leftTabId: 'chats-tab-id', tabIdHoldingCurrentPage: null },
    { leftTabId: null, tabIdHoldingCurrentPage: 'chats-tab-id' },
    { leftTabId: 'chats-tab-id', tabIdHoldingCurrentPage: 'other-tab-id' },
  ])(
    'keeps the remembered pages when $leftTabId does not hold the current page',
    ({ leftTabId, tabIdHoldingCurrentPage }) => {
      expect(
        getLastVisitedUrlsAfterLeavingNavigationMenuTab({
          lastVisitedUrls,
          leftTabId,
          tabIdHoldingCurrentPage,
          currentUrl: '/objects/companies',
        }),
      ).toBe(lastVisitedUrls);
    },
  );
});
