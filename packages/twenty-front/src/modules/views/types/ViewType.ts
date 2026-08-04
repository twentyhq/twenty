import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
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

const VIEW_TYPE_ICON_MAPPING = [
  {
    icon: IconLayoutKanban,
    iconKey: 'IconLayoutKanban',
    value: ViewType.KANBAN,
  },
  { icon: IconTable, iconKey: 'IconTable', value: ViewType.TABLE },
  { icon: IconCalendar, iconKey: 'IconCalendar', value: ViewType.CALENDAR },
] as const satisfies {
  icon: IconComponent;
  iconKey: string;
  value: ViewType;
}[];

export const viewTypeIconMapping = (viewType?: ViewType) => {
  return (
    VIEW_TYPE_ICON_MAPPING.find((type) => type.value === viewType)?.icon ??
    IconTable
  );
};

export const viewTypeIconKeyMapping = (viewType?: ViewType) => {
  return (
    VIEW_TYPE_ICON_MAPPING.find((type) => type.value === viewType)?.iconKey ??
    'IconTable'
  );
};
