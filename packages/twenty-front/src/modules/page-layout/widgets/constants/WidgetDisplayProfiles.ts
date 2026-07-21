import { type WidgetDisplayProfile } from '@/page-layout/widgets/types/WidgetDisplayProfile';
import { WidgetType } from '~/generated-metadata/graphql';

export const WIDGET_DISPLAY_PROFILES: Record<WidgetType, WidgetDisplayProfile> =
  {
    [WidgetType.FIELDS]: { affinity: 'card', scrollStrategy: 'flow' },
    [WidgetType.FIELD]: { affinity: 'card', scrollStrategy: 'flow' },
    [WidgetType.FIELD_RICH_TEXT]: { affinity: 'card', scrollStrategy: 'flow' },
    [WidgetType.STANDALONE_RICH_TEXT]: {
      affinity: 'card',
      scrollStrategy: 'flow',
    },
    [WidgetType.GRAPH]: { affinity: 'card', scrollStrategy: 'flow' },
    [WidgetType.TIMELINE]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.TASKS]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.NOTES]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.FILES]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.EMAILS]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.CALENDAR]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.EMAIL_THREAD]: { affinity: 'module', scrollStrategy: 'flow' },
    [WidgetType.RECORD_TABLE]: { affinity: 'module', scrollStrategy: 'fill' },
    [WidgetType.VIEW]: { affinity: 'module', scrollStrategy: 'fill' },
    [WidgetType.IFRAME]: { affinity: 'module', scrollStrategy: 'fill' },
    [WidgetType.FRONT_COMPONENT]: {
      affinity: 'module',
      scrollStrategy: 'fill',
    },
    [WidgetType.WORKFLOW]: { affinity: 'module', scrollStrategy: 'fill' },
    [WidgetType.WORKFLOW_VERSION]: {
      affinity: 'module',
      scrollStrategy: 'fill',
    },
    [WidgetType.WORKFLOW_RUN]: { affinity: 'module', scrollStrategy: 'fill' },
  };
