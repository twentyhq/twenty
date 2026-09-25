import {
  makeFlagGatedWidget,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { isPageLayoutTabHiddenByFeatureFlags } from '@/page-layout/utils/isPageLayoutTabHiddenByFeatureFlags';

describe('isPageLayoutTabHiddenByFeatureFlags', () => {
  it('should hide a tab every widget of which waits on a missing flag', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tab: {
          widgets: [
            makeFlagGatedWidget('flag-gated-widget-1', 0),
            makeFlagGatedWidget('flag-gated-widget-2', 1),
          ],
        },
        featureFlags: {},
      }),
    ).toBe(true);
  });

  it('should keep a tab once its flag is on', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tab: { widgets: [makeFlagGatedWidget('flag-gated-widget', 0)] },
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toBe(false);
  });

  it('should keep a tab that still renders another widget', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tab: {
          widgets: [
            makeFlagGatedWidget('flag-gated-widget', 0),
            makeWidget('widget', 1),
          ],
        },
        featureFlags: {},
      }),
    ).toBe(false);
  });

  it('should keep an empty tab so it can still be filled', () => {
    expect(
      isPageLayoutTabHiddenByFeatureFlags({
        tab: { widgets: [] },
        featureFlags: {},
      }),
    ).toBe(false);
  });
});
