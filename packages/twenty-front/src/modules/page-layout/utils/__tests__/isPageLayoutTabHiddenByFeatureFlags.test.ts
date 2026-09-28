import {
  makeFlagGatedWidget,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { isPageLayoutTabHiddenByFeatureFlags } from '@/page-layout/utils/isPageLayoutTabHiddenByFeatureFlags';

describe('isPageLayoutTabHiddenByFeatureFlags', () => {
  it('should hide a tab every widget of which waits on a missing flag', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tabId: 'tab-1',
        persistedTabs: [
          makeTab('tab-1', [
            makeFlagGatedWidget('flag-gated-widget-1', 0),
            makeFlagGatedWidget('flag-gated-widget-2', 1),
          ]),
        ],
        featureFlags: {},
      }),
    ).toBe(true);
  });

  it('should keep a tab once its flag is on', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tabId: 'tab-1',
        persistedTabs: [
          makeTab('tab-1', [makeFlagGatedWidget('flag-gated-widget', 0)]),
        ],
        featureFlags: { IS_CONVERSATIONS_TAB_ENABLED: true },
      }),
    ).toBe(false);
  });

  it('should keep a tab that loaded with another widget, whatever the edit left in it', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tabId: 'tab-1',
        persistedTabs: [
          makeTab('tab-1', [
            makeFlagGatedWidget('flag-gated-widget', 0),
            makeWidget('widget', 1),
          ]),
        ],
        featureFlags: {},
      }),
    ).toBe(false);
  });

  it('should keep an empty tab so it can still be filled', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tabId: 'tab-1',
        persistedTabs: [makeTab('tab-1', [])],
        featureFlags: {},
      }),
    ).toBe(false);
  });

  it('should keep a tab created during the edit, even a copy holding only flag-gated widgets', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tabId: 'tab-copy',
        persistedTabs: [
          makeTab('tab-1', [makeFlagGatedWidget('flag-gated-widget', 0)]),
        ],
        featureFlags: {},
      }),
    ).toBe(false);
  });
});
