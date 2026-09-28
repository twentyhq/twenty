import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';
import { WidgetType } from '~/generated-metadata/graphql';

describe('isWidgetEnabledByFeatureFlags', () => {
  it('should hide a chat threads widget unless its flag is on', () => {
    const widget = { type: WidgetType.CHAT_THREADS };

    expect(isWidgetEnabledByFeatureFlags({ widget, featureFlags: {} })).toBe(
      false,
    );
    expect(
      isWidgetEnabledByFeatureFlags({
        widget,
        featureFlags: { IS_CONVERSATIONS_TAB_ENABLED: false },
      }),
    ).toBe(false);
    expect(
      isWidgetEnabledByFeatureFlags({
        widget,
        featureFlags: { IS_CONVERSATIONS_TAB_ENABLED: true },
      }),
    ).toBe(true);
  });

  it('should enable widget types that need no flag', () => {
    expect(
      isWidgetEnabledByFeatureFlags({
        widget: { type: WidgetType.EMAILS },
        featureFlags: {},
      }),
    ).toBe(true);
  });
});
