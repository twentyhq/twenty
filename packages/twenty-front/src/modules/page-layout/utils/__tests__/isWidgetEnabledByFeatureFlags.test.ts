import { isWidgetEnabledByFeatureFlags } from '@/page-layout/utils/isWidgetEnabledByFeatureFlags';
import { WidgetType } from '~/generated-metadata/graphql';

describe('isWidgetEnabledByFeatureFlags', () => {
  it('should hide a chat threads widget unless its flag is on', () => {
    const widget = {
      type: WidgetType.CHAT_THREADS,
      conditionalAvailabilityExpression: null,
    };

    expect(isWidgetEnabledByFeatureFlags({ widget, featureFlags: {} })).toBe(
      false,
    );
    expect(
      isWidgetEnabledByFeatureFlags({
        widget,
        featureFlags: { IS_MESSAGES_TAB_ENABLED: false },
      }),
    ).toBe(false);
    expect(
      isWidgetEnabledByFeatureFlags({
        widget,
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toBe(true);
  });

  it('should evaluate an expression that reads only feature flags', () => {
    const flagOn = {
      type: WidgetType.EMAILS,
      conditionalAvailabilityExpression: 'featureFlags.IS_MESSAGES_TAB_ENABLED',
    };
    const flagOff = {
      type: WidgetType.EMAILS,
      conditionalAvailabilityExpression:
        'not featureFlags.IS_MESSAGES_TAB_ENABLED',
    };

    expect(
      isWidgetEnabledByFeatureFlags({ widget: flagOn, featureFlags: {} }),
    ).toBe(false);
    expect(
      isWidgetEnabledByFeatureFlags({ widget: flagOff, featureFlags: {} }),
    ).toBe(true);
    expect(
      isWidgetEnabledByFeatureFlags({
        widget: flagOn,
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toBe(true);
    expect(
      isWidgetEnabledByFeatureFlags({
        widget: flagOff,
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toBe(false);
  });

  it('should evaluate the feature flag condition a viewer condition was joined to', () => {
    const widget = {
      type: WidgetType.EMAILS,
      conditionalAvailabilityExpression:
        '(not featureFlags.IS_MESSAGES_TAB_ENABLED) and (device == "MOBILE")',
    };

    expect(isWidgetEnabledByFeatureFlags({ widget, featureFlags: {} })).toBe(
      true,
    );
    expect(
      isWidgetEnabledByFeatureFlags({
        widget,
        featureFlags: { IS_MESSAGES_TAB_ENABLED: true },
      }),
    ).toBe(false);
  });

  it('should leave expressions that read more than feature flags to the viewer context', () => {
    expect(
      isWidgetEnabledByFeatureFlags({
        widget: {
          type: WidgetType.EMAILS,
          conditionalAvailabilityExpression:
            'device == "DESKTOP" and featureFlags.IS_MESSAGES_TAB_ENABLED',
        },
        featureFlags: {},
      }),
    ).toBe(true);
    expect(
      isWidgetEnabledByFeatureFlags({
        widget: {
          type: WidgetType.EMAILS,
          conditionalAvailabilityExpression: null,
        },
        featureFlags: {},
      }),
    ).toBe(true);
  });
});
