import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconListDetails,
  IconTable,
} from 'twenty-ui/icon';

export { ViewType } from '~/generated-metadata/graphql';
import { ViewType } from '~/generated-metadata/graphql';

type ViewTypeLabelKey = `${ViewType}`;

export const VIEW_TYPE_LABELS = {
  [ViewType.TABLE]: msg`Table`,
  [ViewType.KANBAN]: msg`Kanban`,
  [ViewType.CALENDAR]: msg`Calendar`,
  [ViewType.FIELDS_WIDGET]: msg`Fields widget`,
  [ViewType.TABLE_WIDGET]: msg`Table widget`,
  [ViewType.KANBAN_WIDGET]: msg`Kanban widget`,
  [ViewType.CALENDAR_WIDGET]: msg`Calendar widget`,
} satisfies Record<ViewTypeLabelKey, MessageDescriptor>;

export const getViewTypeLabel = (
  viewType: ViewTypeLabelKey = ViewType.TABLE,
): MessageDescriptor =>
  VIEW_TYPE_LABELS[viewType] ?? VIEW_TYPE_LABELS[ViewType.TABLE];

const VIEW_TYPE_ICON_MAPPING = {
  [ViewType.TABLE]: {
    icon: IconTable,
    iconKey: 'IconTable',
  },
  [ViewType.KANBAN]: {
    icon: IconLayoutKanban,
    iconKey: 'IconLayoutKanban',
  },
  [ViewType.CALENDAR]: {
    icon: IconCalendar,
    iconKey: 'IconCalendar',
  },
  [ViewType.FIELDS_WIDGET]: {
    icon: IconListDetails,
    iconKey: 'IconListDetails',
  },
  [ViewType.TABLE_WIDGET]: {
    icon: IconTable,
    iconKey: 'IconTable',
  },
  [ViewType.KANBAN_WIDGET]: {
    icon: IconLayoutKanban,
    iconKey: 'IconLayoutKanban',
  },
  [ViewType.CALENDAR_WIDGET]: {
    icon: IconCalendar,
    iconKey: 'IconCalendar',
  },
} as const satisfies Record<
  ViewType,
  {
    icon: IconComponent;
    iconKey: string;
  }
>;

export const viewTypeIconMapping = (viewType: ViewType = ViewType.TABLE) =>
  VIEW_TYPE_ICON_MAPPING[viewType].icon;

export const viewTypeIconKeyMapping = (viewType: ViewType = ViewType.TABLE) =>
  VIEW_TYPE_ICON_MAPPING[viewType].iconKey;
