import {
  DEFAULT_WIDGET_DISPLAY_PROFILE,
  WIDGET_DISPLAY_PROFILES,
} from '@/page-layout/widgets/constants/WidgetDisplayProfiles';
import { type WidgetDisplayProfile } from '@/page-layout/widgets/types/WidgetDisplayProfile';
import { type WidgetType } from '~/generated-metadata/graphql';

export const getWidgetDisplayProfile = (
  widgetType: WidgetType,
): WidgetDisplayProfile =>
  WIDGET_DISPLAY_PROFILES[widgetType] ?? DEFAULT_WIDGET_DISPLAY_PROFILE;
