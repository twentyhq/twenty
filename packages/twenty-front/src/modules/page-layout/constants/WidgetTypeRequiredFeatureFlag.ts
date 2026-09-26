import { FeatureFlagKey, WidgetType } from '~/generated-metadata/graphql';

// A widget type still rolling out renders only where its flag is on, whatever
// layout holds it, including one shipped by an app.
export const WIDGET_TYPE_REQUIRED_FEATURE_FLAG: Partial<
  Record<WidgetType, FeatureFlagKey>
> = {
  [WidgetType.CHAT_THREADS]: FeatureFlagKey.IS_MESSAGES_TAB_ENABLED,
};
